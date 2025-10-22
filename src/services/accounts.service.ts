import {
  Account,
  Prisma,
  AccountRole
} from "@prisma/client";
import { prisma } from "./prisma.service";
import { AuthService } from ".";
import { DEFAULT_PAGE_SIZE } from "@/constants/app";
import { PaginationParams } from "@/interfaces/common";
import { paginateItems } from "@/utilities/common";


export class AccountService {

  static createAccount = async (params: Prisma.AccountCreateInput, hashed = true) => {
    const hashedPassword = params.password ? await AuthService.hashPassword(params.password) : undefined;
    const account = await prisma.account.create({
      data: {
        ...params,
        email: params.email.toLowerCase(),
        password: params.password ? (hashed ? hashedPassword : params.password) : undefined,
      },
      include: { avatar: { select: { url: true } } },
    });
    prisma.verificationToken.delete({
      where: { email: account.email },
    });
    return { ...account, password: !!params.password }
  };


  static setAccountPassword = async (id: Account['id'], password: string) => {
    const hashedPassword = await AuthService.hashPassword(password);
    const account = await prisma.account.update({
      where: { id },
      data: { password: hashedPassword },
      include: { business: true, subscription: true, avatar: { select: { url: true } } },
    });
    return { ...account, password: true };
  };

  static updateAccount = async (
    id: Account['id'],
    data: Partial<Prisma.AccountUpdateInput>,
  ) => {
    const { password: p, ...updatedData } = data;
    const updated = await prisma.account.update({
      where: { id },
      include: { business: true, subscription: true, avatar: { select: { url: true } } },
      data: updatedData,
    });
    return { ...updated, password: !!updated.password }
  };

  static changePassword = async (accountId: Account['id'], password: string) => {
    const hashedPassword = await AuthService.hashPassword(password);
    const account = await prisma.account.update({
      where: { id: accountId },
      data: { password: hashedPassword },
    });
    return { ...account, password: !!account.password }
  };

  static getUser = async (identifier: Account['id'] | Account['email']) => {
    const account = await prisma.account.findFirst({
      where: {
        OR: [
          { id: identifier || undefined },
          { email: `${identifier}`.toLowerCase() },
        ],
        role: AccountRole.user,
      },
      include: { business: true, subscription: true, avatar: { select: { url: true } } },
    });
    if (!account) {
      return null;
    }
    return { ...account, password: !!account.password }
  };

  static getUsersForAdmin = async (query: Partial<Account & PaginationParams>) => {
    const {
      pageSize = DEFAULT_PAGE_SIZE,
      page = 1,
      search = "",
    } = query

    const WHERE_QUERY: Prisma.AccountWhereInput = {
      role: AccountRole.user,
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ],
    }
    const accounts = await prisma.account.findMany({
      where: WHERE_QUERY,
      skip: (Number(page) - 1) * Number(pageSize),
      take: Number(pageSize),
      include: { business: true, subscription: true, avatar: { select: { url: true } } },
    });
    const total = await prisma.account.count({
      where: WHERE_QUERY,
    });
    const paginated = paginateItems({
      page,
      pageSize,
      total,
      items: accounts.map((x) => ({ ...x, password: undefined })),
    });
    return paginated;
  };

  static getAccount = async (
    identifier: Account['id'] | Account['email'] | Account['appAccountToken'],
    includeDeleted?: boolean,
    includeBanned?: boolean,
    includeDevices?: boolean
  ) => {
    const account = await prisma.account.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: `${identifier}`.toLowerCase() },
          { appAccountToken: identifier }
        ],
        deleted: includeDeleted ? undefined : false,
        banned: includeBanned ? undefined : false,
      },
      include: {
        business: true,
        subscription: true,
        avatar: { select: { url: true } },
        accountDevices: includeDevices
      },
    });
    if (!account) {
      return null;
    }
    return { ...account, password: !!account.password }
  };

  static checkIfEmailExists = async (email: string) => {
    const account = await prisma.account.findFirst({
      where: { email: email.toLowerCase() },
      include: { business: true, subscription: true },
    });
    // console.log("checkIfEmailExists", email, account?.email)
    return !!account
  };


  static createVerificationToken = async (email: string) => {
    let verificationToken;
    const code = AuthService.generateVerificationToken();
    verificationToken = await prisma.verificationToken.findUnique({
      where: { email },
    });
    if (!verificationToken) {
      verificationToken = await prisma.verificationToken.create({
        data: { email, code },
      });
    } else {
      verificationToken = await prisma.verificationToken.update({
        where: { email },
        data: { code }
      });
    }
    return verificationToken;
    // TODO: check if otp has been called more than once in 1mins, 
    // then throw http error
    // or just implement a count
  };


  static getVerificationToken = async (email: string, code: string) => {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { email, code },
    });
    return verificationToken;
  };

  static getVerificationTokenByCode = async (code: string) => {
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { code },
    });
    return verificationToken;
  };

  static verifyVerificationTokenbyCode = async (code: string) => {
    // const oneHourAgo = new Date();
    // oneHourAgo.setHours(oneHourAgo.getHours() - 1); // Get the time 1 hour ago

    const verificationToken = await prisma.verificationToken.findFirst({
      where: { code },
    });
    if (!verificationToken) {
      return false
    }
    // await deleteOTP(otp.email, otp.code);
    // return otp.createdAt < oneHourAgo;
    return verificationToken;
  };

  static deleteVerificationToken = async (email: string, code: string) => {
    const otp = await prisma.verificationToken.delete({
      where: { email, code },
    });
  };

  static authenticate = async (identifier: string, password: string) => {
    const account = await prisma.account.findFirst({
      where: {
        email: `${identifier}`.toLowerCase(),
      },
    });
    if (account) {
      if (!account.password) {
        return { isAuthenticated: false, isSocialAccount: true };
      }
      const isPasswordCorrect = await AuthService.comparePasswords(password, account.password);
      if (isPasswordCorrect && account.deleted) {
        await this.restoreAccount(account.id)
      }
      return { isAuthenticated: isPasswordCorrect, isSocialAccount: false };
    }
    return { isAuthenticated: false, isSocialAccount: false };
  };


  static syncLastLogin = async (accountId: Account['id'], lastLogin: Account['lastLogin']) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    if (!lastLogin || lastLogin < todayStart) {
      await prisma.account.update({
        where: { id: accountId },
        data: { lastLogin: now }
      })
    }
  }

  static storeExpoPushToken = async (accountId: Account['id'], expoPushToken: string, deviceName: string) => {
    const accountDevice = await prisma.accountDevice.upsert({
      where: { expoPushToken },
      update: {},
      create: { expoPushToken, accountId, name: deviceName }
    })
    return accountDevice
  }

  static removeExpoPushToken = async (accountId: Account['id'], expoPushToken: string) => {
    const accountDevice = await prisma.accountDevice.delete({
      where: { accountId, expoPushToken }
    })
    return accountDevice
  }
  static removeBareExpoPushToken = async (expoPushToken: string) => {
    const accountDevice = await prisma.accountDevice.delete({
      where: { expoPushToken }
    })
    return accountDevice
  }

  // Danger zone
  static deleteAccount = async (accountId: Account['id']) => {
    await prisma.account.delete({
      where: { id: accountId }
    })
  }

  static deactivateAccount = async (accountId: Account['id']) => {
    // await PostService.softDeleteAccountPosts(accountId)
    // TODO: notifications 
    const account = await prisma.account.update({
      where: { id: accountId },
      data: {
        deleted: true,
        deletedAt: new Date
      }
    })
    return !!account.deleted
  }


  static restoreAccount = async (accountId: Account['id']) => {
    // await PostService.restoreAccountPosts(accountId)
    const account = await prisma.account.update({
      where: { id: accountId },
      data: {
        deleted: false,
        // deletedAt: null,
      }
    })
    return account.deleted === false
  }
}
