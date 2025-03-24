"use strict";exports.id=2977,exports.ids=[2977],exports.modules={8046:(t,e,a)=>{a.d(e,{db:()=>s});var r=a(5900),i=a(4107);let n=new r.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1},max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3});n.on("connect",()=>{console.log("Database connection established")}),n.on("error",t=>{console.error("Unexpected database error:",t)});let s={async query(t,e=[]){let a=await n.connect();try{let r=Date.now(),i=await a.query(t,e),n=Date.now()-r;return n>100&&console.log("Slow query:",{text:t,duration:n,rows:i.rowCount}),i}catch(t){(0,i.dy)(t)}finally{a.release()}},async transaction(t){let e=await n.connect();try{await e.query("BEGIN");let a=await t(e);return await e.query("COMMIT"),a}catch(t){await e.query("ROLLBACK"),(0,i.dy)(t)}finally{e.release()}},async insert(t,e){let a=Object.keys(e),r=Object.values(e),i=a.map((t,e)=>`$${e+1}`).join(", "),n=a.join(", "),s=`
      INSERT INTO ${t} (${n})
      VALUES (${i})
      RETURNING *
    `;return(await this.query(s,r)).rows[0]},async update(t,e,a){let r=Object.keys(a),i=Object.values(a),n=r.map((t,e)=>`${t} = $${e+1}`).join(", "),s=`
      UPDATE ${t}
      SET ${n}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${r.length+1}
      RETURNING *
    `;return(await this.query(s,[...i,e])).rows[0]},async findWithPagination(t,e={},a={}){let{page:r=1,limit:i=20,orderBy:n="created_at",order:s="DESC",fields:o="*"}=a,d=Object.keys(e),c=Object.values(e),l="";d.length>0&&(l="WHERE "+d.map((t,e)=>null===c[e]?`${t} IS NULL`:`${t} = $${e+1}`).join(" AND "));let u=`
      SELECT COUNT(*) as total
      FROM ${t}
      ${l}
    `,$=`
      SELECT ${o}
      FROM ${t}
      ${l}
      ORDER BY ${n} ${s}
      LIMIT ${i} OFFSET ${(r-1)*i}
    `,[E,f]=await Promise.all([this.query(u,c),this.query($,c)]),w=parseInt(E.rows[0].total);return{data:f.rows,pagination:{page:Number(r),limit:Number(i),total:w,pages:Math.ceil(w/i)}}},async end(){await n.end(),console.log("Database connection pool has ended")}}},4107:(t,e,a)=>{a.d(e,{dR:()=>i,dy:()=>n,p8:()=>r}),a(8070);class r extends Error{constructor(t){super(t),this.name="ValidationError",this.code="VALIDATION_ERROR"}}class i extends Error{constructor(t="Resource"){super(`${t} not found`),this.name="NotFoundError",this.code="NOT_FOUND"}}function n(t){if(console.error("Database error:",t),"23505"===t.code)throw new r("A record with this information already exists");if("23503"===t.code)throw new r("Referenced record does not exist");if("42P01"===t.code)throw Error("Database schema issue: Table does not exist");throw Error("Database operation failed")}},2977:(t,e,a)=>{a.d(e,{Np:()=>$,dI:()=>g,nC:()=>f,hi:()=>S,Ms:()=>E,R2:()=>y,xM:()=>p});var r=a(8046),i=a(4107),n=a(6113),s=a.n(n);let o={randomUUID:s().randomUUID},d=new Uint8Array(256),c=d.length,l=[];for(let t=0;t<256;++t)l.push((t+256).toString(16).slice(1));let u=function(t,e,a){if(o.randomUUID&&!e&&!t)return o.randomUUID();let r=(t=t||{}).random||(t.rng||function(){return c>d.length-16&&(s().randomFillSync(d),c=0),d.slice(c,c+=16)})();if(r[6]=15&r[6]|64,r[8]=63&r[8]|128,e){a=a||0;for(let t=0;t<16;++t)e[a+t]=r[t];return e}return function(t,e=0){return l[t[e+0]]+l[t[e+1]]+l[t[e+2]]+l[t[e+3]]+"-"+l[t[e+4]]+l[t[e+5]]+"-"+l[t[e+6]]+l[t[e+7]]+"-"+l[t[e+8]]+l[t[e+9]]+"-"+l[t[e+10]]+l[t[e+11]]+l[t[e+12]]+l[t[e+13]]+l[t[e+14]]+l[t[e+15]]}(r)};async function $(t,e){let{name:a,description:n,fields:s,settings:o={},status:d="active"}=t;if(!a)throw new i.p8("Form name is required");if(!Array.isArray(s)||0===s.length)throw new i.p8("Form must have at least one field");let c={id:u(),organization_id:e,name:a,description:n,fields:JSON.stringify(s),settings:JSON.stringify(o),status:d,created_at:new Date().toISOString(),updated_at:new Date().toISOString()},l=(await r.db.query(`
    INSERT INTO forms (
      id, organization_id, name, description, fields, settings, status, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,[c.id,c.organization_id,c.name,c.description,c.fields,c.settings,c.status,c.created_at,c.updated_at])).rows[0];return{...l,fields:JSON.parse(l.fields),settings:JSON.parse(l.settings)}}async function E(t,e={}){let{status:a,limit:i=50,offset:n=0}=e,s=`
    SELECT * FROM forms
    WHERE organization_id = $1
  `,o=[t],d=1;return a&&(s+=` AND status = $${++d}`,o.push(a)),s+=` ORDER BY created_at DESC LIMIT $${++d} OFFSET $${++d}`,o.push(i,n),(await r.db.query(s,o)).rows.map(t=>({...t,fields:JSON.parse(t.fields),settings:JSON.parse(t.settings)}))}async function f(t,e){let a=await r.db.query(`
    SELECT * FROM forms
    WHERE id = $1 AND organization_id = $2
  `,[t,e]);if(0===a.rows.length)throw new i.dR("Form");let n=a.rows[0];return{...n,fields:JSON.parse(n.fields),settings:JSON.parse(n.settings)}}async function w(t){let e=await r.db.query(`
    SELECT * FROM forms
    WHERE id = $1 AND status = 'active'
  `,[t]);if(0===e.rows.length)throw new i.dR("Form");let a=e.rows[0];return{...a,fields:JSON.parse(a.fields),settings:JSON.parse(a.settings)}}async function p(t,e,a){await f(t,e);let{name:i,description:n,fields:s,settings:o,status:d}=a,c={},l=[],u=0;void 0!==i&&(c.name=`$${++u}`,l.push(i)),void 0!==n&&(c.description=`$${++u}`,l.push(n)),void 0!==s&&(c.fields=`$${++u}`,l.push(JSON.stringify(s))),void 0!==o&&(c.settings=`$${++u}`,l.push(JSON.stringify(o))),void 0!==d&&(c.status=`$${++u}`,l.push(d)),c.updated_at=`$${++u}`,l.push(new Date().toISOString()),l.push(t,e);let $=Object.entries(c).map(([t,e])=>`${t} = ${e}`).join(", "),E=(await r.db.query(`
    UPDATE forms
    SET ${$}
    WHERE id = $${++u} AND organization_id = $${++u}
    RETURNING *
  `,l)).rows[0];return{...E,fields:JSON.parse(E.fields),settings:JSON.parse(E.settings)}}async function g(t,e){await f(t,e),await r.db.query(`
    DELETE FROM forms
    WHERE id = $1 AND organization_id = $2
  `,[t,e])}async function y(t,e){let a=await w(t),i={id:u(),form_id:t,organization_id:a.organization_id,data:JSON.stringify(e),created_at:new Date().toISOString()},n=(await r.db.query(`
    INSERT INTO form_submissions (
      id, form_id, organization_id, data, created_at
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,[i.id,i.form_id,i.organization_id,i.data,i.created_at])).rows[0];return{...n,data:JSON.parse(n.data)}}async function S(t,e,a={}){let{limit:i=50,offset:n=0}=a;return await f(t,e),(await r.db.query(`
    SELECT * FROM form_submissions
    WHERE form_id = $1 AND organization_id = $2
    ORDER BY created_at DESC
    LIMIT $3 OFFSET $4
  `,[t,e,i,n])).rows.map(t=>({...t,data:JSON.parse(t.data)}))}}};