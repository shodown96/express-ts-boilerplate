// import { prisma } from "../services/prisma.service";

// export const switchInvoiceIdToApiId = async () => {
//     console.log("migration started")
//     const transactions = await prisma.transaction.findMany();
//     for (const txn of transactions) {
//         const tran = oldTransactions.items.find(v => v.id === txn.id)
//         await prisma.transaction.update({ where: { id: txn.id }, data: { apiId: tran?.invoiceId } })
//     }
//     console.log("migration completed")
// }
