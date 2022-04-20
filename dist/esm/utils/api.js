import { __awaiter } from "tslib";
import { withFindOrInitAssociatedTokenAccount } from "@cardinal/certificates";
import * as namespaces from "@cardinal/namespaces";
import * as BufferLayout from "@solana/buffer-layout";
import * as splToken from "@solana/spl-token";
import * as web3 from "@solana/web3.js";
import { signAndSendTransaction } from "./transactions";
export function apiBase(dev) {
    return `https://${dev ? "dev-api" : "api"}.cardinal.so`;
}
export function tryGetNameEntry(connection, namespaceName, entryName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const entry = yield namespaces.getNameEntry(connection, namespaceName, entryName);
            return entry;
        }
        catch (e) {
            return null;
        }
    });
}
export function revokeAndClaim(cluster, connection, wallet, namespaceName, entryName, duration, reverseEntryId, claimRequestId, certificateMintId, certificateOwnerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const entry = yield tryGetNameEntry(connection, namespaceName, entryName);
        const transaction = new web3.Transaction();
        if (!(entry === null || entry === void 0 ? void 0 : entry.parsed.reverseEntry)) {
            yield namespaces.withRevokeReverseEntry(connection, wallet, namespaceName, entryName, reverseEntryId, claimRequestId, transaction);
        }
        yield namespaces.withRevokeEntry(connection, wallet, namespaceName, entryName, certificateMintId, certificateOwnerId, claimRequestId, transaction);
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (yield connection.getRecentBlockhash("max")).blockhash;
        yield wallet.signTransaction(transaction);
        const txid = yield web3.sendAndConfirmRawTransaction(connection, transaction.serialize());
        const transaction2 = new web3.Transaction();
        yield namespaces.withClaimEntry(connection, wallet, namespaceName, entryName, certificateMintId, duration || 0, transaction2);
        yield namespaces.withSetReverseEntry(connection, wallet, namespaceName, entryName, certificateMintId, transaction2);
        transaction2.feePayer = wallet.publicKey;
        transaction2.recentBlockhash = (yield connection.getRecentBlockhash("max")).blockhash;
        yield wallet.signTransaction(transaction2);
        return web3.sendAndConfirmRawTransaction(connection, transaction2.serialize());
    });
}
export function setReverseEntry(connection, wallet, namespaceName, entryName, certificateMintId) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield namespaces.withSetReverseEntry(connection, wallet, namespaceName, entryName, certificateMintId, new web3.Transaction());
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (yield connection.getRecentBlockhash("max")).blockhash;
        yield wallet.signTransaction(transaction);
        let txid = null;
        txid = yield web3.sendAndConfirmRawTransaction(connection, transaction.serialize());
        return txid;
    });
}
export function initAndClaimEntry(cluster, connection, wallet, namespaceName, entryName, duration) {
    return __awaiter(this, void 0, void 0, function* () {
        const certificateMint = web3.Keypair.generate();
        const transaction = new web3.Transaction();
        yield namespaces.withInitEntry(connection, wallet, certificateMint.publicKey, namespaceName, entryName, transaction);
        yield namespaces.withClaimEntry(connection, wallet, namespaceName, entryName, certificateMint.publicKey, duration || 0, transaction);
        yield namespaces.withSetReverseEntry(connection, wallet, namespaceName, entryName, certificateMint.publicKey, transaction);
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (yield connection.getRecentBlockhash("max")).blockhash;
        yield wallet.signTransaction(transaction);
        yield transaction.partialSign(certificateMint);
        return web3.sendAndConfirmRawTransaction(connection, transaction.serialize());
    });
}
export function claimEntry(connection, wallet, namespaceName, entryName, certificateMintId, duration) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield namespaces.withClaimEntry(connection, wallet, namespaceName, entryName, certificateMintId, duration || 0, new web3.Transaction());
        yield namespaces.withSetReverseEntry(connection, wallet, namespaceName, entryName, certificateMintId, transaction);
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (yield connection.getRecentBlockhash("max")).blockhash;
        yield wallet.signTransaction(transaction);
        let txid = null;
        txid = yield web3.sendAndConfirmRawTransaction(connection, transaction.serialize());
        return txid;
    });
}
export function setEntryData(connection, wallet, namespaceName, entryName, entryData) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield namespaces.withSetEntryData(connection, wallet, namespaceName, entryName, new web3.PublicKey(entryData), new web3.Transaction());
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (yield connection.getRecentBlockhash("max")).blockhash;
        yield wallet.signTransaction(transaction);
        let txid = null;
        txid = yield web3.sendAndConfirmRawTransaction(connection, transaction.serialize());
        return txid;
    });
}
export function approveClaimRequest(connection, wallet, namespaceName, claimRequestId) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield namespaces.withUpdateClaimRequest(connection, wallet, namespaceName, claimRequestId, true, new web3.Transaction());
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (yield connection.getRecentBlockhash("max")).blockhash;
        yield wallet.signTransaction(transaction);
        let txid = null;
        txid = yield web3.sendAndConfirmRawTransaction(connection, transaction.serialize());
        return txid;
    });
}
export function getPendingClaimRequests(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        return namespaces.getPendingClaimRequests(connection);
    });
}
export function createClaimRequest(connection, wallet, namespaceName, entryName) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield signAndSendTransaction(connection, wallet, yield namespaces.withCreateClaimRequest(connection, wallet, namespaceName, entryName, wallet.publicKey, new web3.Transaction()));
    });
}
export function wrapSol(connection, wallet, lamports) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Wrapping ${lamports} lamports`);
        const transaction = new web3.Transaction();
        const nativeAssociatedTokenAccountId = yield withFindOrInitAssociatedTokenAccount(transaction, connection, splToken.NATIVE_MINT, wallet.publicKey, wallet.publicKey);
        transaction.add(web3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: nativeAssociatedTokenAccountId,
            lamports,
        }));
        transaction.add(createSyncNativeInstruction(nativeAssociatedTokenAccountId));
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (yield connection.getRecentBlockhash("max")).blockhash;
        yield wallet.signTransaction(transaction);
        return yield web3.sendAndConfirmRawTransaction(connection, transaction.serialize());
    });
}
export function createSyncNativeInstruction(nativeAccount) {
    // @ts-ignore
    const dataLayout = BufferLayout.struct([BufferLayout.u8("instruction")]);
    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode({
        instruction: 17, // SyncNative instruction
    }, data);
    const keys = [{ pubkey: nativeAccount, isSigner: false, isWritable: true }];
    return new web3.TransactionInstruction({
        keys,
        programId: splToken.TOKEN_PROGRAM_ID,
        data,
    });
}
//# sourceMappingURL=api.js.map