async function cleanupExpiredOAuthStates(t){const e=Math.floor(Date.now()/1e3);try{return(await t.oAuthState.deleteMany({where:{expiresAt:{lt:e}}})).count}catch(t){return console.error("Failed to cleanup expired OAuth states:",t),0}}export{cleanupExpiredOAuthStates};
//# sourceMappingURL=oauthCleanup.mjs.map
