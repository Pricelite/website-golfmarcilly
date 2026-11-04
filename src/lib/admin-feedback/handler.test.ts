import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("feedback only confirms successful delivery, protects destination, limits duplicates and permits retry after failure", () => {
  const result = spawnSync(process.execPath, ["--conditions=react-server", "--import", "tsx", "--input-type=module", "-e", `
    import assert from 'node:assert/strict';
    import { handleFeedback } from './src/lib/admin-feedback/handler.ts';
    const payload = { type:'Bug', message:'Bouton cassé', email:'visitor@example.org', page:'/golf', website:'', openedAt:Date.now()-3000 };
    const request = (body=payload, origin='https://www.golfdemarcilly.com') => new Request('https://www.golfdemarcilly.com/api/admin-feedback', {method:'POST', headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
    let sends=0, releases=0, mail, blocked=false;
    const deps = {send:async value=>{sends++;mail=value;},consume:async options=>({allowed:!(blocked && options.namespace==='admin-feedback-dedupe'),retryAfterSeconds:60}),release:async()=>{releases++;}};
    delete process.env.ADMIN_FEEDBACK_EMAIL_TO;
    assert.equal((await handleFeedback(request(),deps)).status,503);
    assert.equal(sends,0);
    process.env.ADMIN_FEEDBACK_EMAIL_TO='private-target@example.org';
    const sent=await handleFeedback(request(),deps);
    assert.equal(sent.status,200);assert.deepEqual(await sent.json(),{ok:true});assert.equal(sends,1);
    assert.equal(mail.to,process.env.ADMIN_FEEDBACK_EMAIL_TO);assert.equal(mail.replyTo,payload.email);
    const failed=await handleFeedback(request(),{...deps,send:async()=>{throw new Error('smtp secret private-target@example.org');}});
    assert.equal(failed.status,503);assert.equal(releases,1);
    const text=await failed.text();assert.ok(!text.includes('private-target'));assert.ok(!text.includes('smtp'));
    assert.equal((await handleFeedback(request(),deps)).status,200);
    blocked=true;const count=sends;
    assert.equal((await handleFeedback(request(),deps)).status,429);assert.equal(sends,count);
    assert.equal((await handleFeedback(request(),{...deps,consume:async()=>({allowed:false,unavailable:true,retryAfterSeconds:60})})).status,503);
    assert.equal((await handleFeedback(request(payload,'https://evil.example'),deps)).status,403);
    assert.equal((await handleFeedback(request(null),deps)).status,400);
    assert.equal((await handleFeedback(request({...payload,message:'x'.repeat(21000)}),deps)).status,413);
  `], { encoding: "utf8", env: { ...process.env, NEXT_PUBLIC_SITE_URL: "https://www.golfdemarcilly.com" } });
  assert.equal(result.status, 0, result.stderr);
});
