"use strict";(()=>{var e={};e.id=1459,e.ids=[1459],e.modules={2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5900:e=>{e.exports=require("pg")},4300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},2781:e=>{e.exports=require("stream")},3837:e=>{e.exports=require("util")},2306:(e,r,t)=>{t.r(r),t.d(r,{headerHooks:()=>h,originalPathname:()=>P,patchFetch:()=>q,requestAsyncStorage:()=>f,routeModule:()=>m,serverHooks:()=>j,staticGenerationAsyncStorage:()=>x,staticGenerationBailout:()=>g});var n={};t.r(n),t.d(n,{DELETE:()=>c,GET:()=>l,PUT:()=>d});var i=t(5419),s=t(9108),o=t(9678),a=t(8070),u=t(9899),p=t(9151);async function l(e,{params:r}){try{let{id:t}=r,n=(0,p.mk)(e);if(!n)return a.Z.json({error:"Authentication required"},{status:401});let i=await (0,u.qR)(t,n);return a.Z.json({pipeline:i})}catch(e){if(console.error("Get pipeline error:",e),"Pipeline not found"===e.message)return a.Z.json({error:"Pipeline not found"},{status:404});return a.Z.json({error:"Failed to retrieve pipeline"},{status:500})}}async function d(e,{params:r}){try{let{id:t}=r,n=(0,p.mk)(e);if(!n)return a.Z.json({error:"Authentication required"},{status:401});let{name:i,description:s}=await e.json();if(!i)return a.Z.json({error:"Pipeline name is required"},{status:400});let o=await (0,u.xG)(t,n,{name:i,description:s});return a.Z.json({message:"Pipeline updated successfully",pipeline:o})}catch(e){if(console.error("Update pipeline error:",e),"Pipeline not found"===e.message)return a.Z.json({error:"Pipeline not found"},{status:404});if("Pipeline with this name already exists"===e.message)return a.Z.json({error:"Pipeline with this name already exists"},{status:409});return a.Z.json({error:"Failed to update pipeline"},{status:500})}}async function c(e,{params:r}){try{let{id:t}=r,n=(0,p.mk)(e);if(!n)return a.Z.json({error:"Authentication required"},{status:401});return await (0,u.A4)(t,n),a.Z.json({message:"Pipeline deleted successfully"})}catch(e){if(console.error("Delete pipeline error:",e),"Pipeline not found"===e.message)return a.Z.json({error:"Pipeline not found"},{status:404});return a.Z.json({error:"Failed to delete pipeline"},{status:500})}}let m=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/pipelines/[id]/route",pathname:"/api/pipelines/[id]",filename:"route",bundlePath:"app/api/pipelines/[id]/route"},resolvedPagePath:"/home/ubuntu/marketingsoftware/marketingsoftware-main/src/app/api/pipelines/[id]/route.js",nextConfigOutput:"standalone",userland:n}),{requestAsyncStorage:f,staticGenerationAsyncStorage:x,serverHooks:j,headerHooks:h,staticGenerationBailout:g}=m,P="/api/pipelines/[id]/route";function q(){return(0,o.patchFetch)({serverHooks:j,staticGenerationAsyncStorage:x})}}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),n=r.X(0,[1638,6206,7145,7439,4314],()=>t(2306));module.exports=n})();