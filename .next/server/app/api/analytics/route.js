"use strict";(()=>{var e={};e.id=1567,e.ids=[1567],e.modules={2934:e=>{e.exports=require("next/dist/client/components/action-async-storage.external.js")},4580:e=>{e.exports=require("next/dist/client/components/request-async-storage.external.js")},5869:e=>{e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},5900:e=>{e.exports=require("pg")},4300:e=>{e.exports=require("buffer")},6113:e=>{e.exports=require("crypto")},2781:e=>{e.exports=require("stream")},3837:e=>{e.exports=require("util")},2070:(e,t,a)=>{a.r(t),a.d(t,{headerHooks:()=>k,originalPathname:()=>P,patchFetch:()=>x,requestAsyncStorage:()=>q,routeModule:()=>W,serverHooks:()=>z,staticGenerationAsyncStorage:()=>B,staticGenerationBailout:()=>j});var n={};a.r(n),a.d(n,{GET:()=>b,POST:()=>f});var s=a(5419),i=a(9108),o=a(9678),r=a(8070),c=a(8046);async function u(e,t,a={},n=null,s=null){let i={user_id:e,event_type:t,event_data:a,source:n,campaign:s,timestamp:new Date().toISOString()};return(await c.db.query("INSERT INTO analytics_events (user_id, event_type, event_data, source, campaign, timestamp) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",[i.user_id,i.event_type,i.event_data,i.source,i.campaign,i.timestamp])).rows[0]}async function d(e,t={}){let a,n;let{startDate:s,endDate:i,groupBy:o="event_type"}=t;"time"===o?(a="DATE_TRUNC('day', timestamp)",n="DATE_TRUNC('day', timestamp) as day, event_type, COUNT(*) as count"):"source"===o?(a="source, event_type",n="source, event_type, COUNT(*) as count"):(a="event_type",n="event_type, COUNT(*) as count");let r={text:`SELECT ${n} FROM analytics_events WHERE user_id = $1`,values:[e]};return s&&i&&(r.text+=" AND timestamp BETWEEN $2 AND $3",r.values.push(s,i)),r.text+=` GROUP BY ${a} ORDER BY count DESC`,(await c.db.query(r.text,r.values)).rows}async function E(e,t={}){let a,n;let{startDate:s,endDate:i,eventTypes:o=[],groupBy:r="event_type"}=t;"time"===r?(a="DATE_TRUNC('day', e.timestamp)",n="DATE_TRUNC('day', e.timestamp) as day, e.event_type, COUNT(*) as event_count, COUNT(DISTINCT e.user_id) as unique_users"):"source"===r?(a="e.source, e.event_type",n="e.source, e.event_type, COUNT(*) as event_count, COUNT(DISTINCT e.user_id) as unique_users"):"campaign"===r?(a="e.campaign, e.event_type",n="e.campaign, e.event_type, COUNT(*) as event_count, COUNT(DISTINCT e.user_id) as unique_users"):(a="e.event_type",n="e.event_type, COUNT(*) as event_count, COUNT(DISTINCT e.user_id) as unique_users");let u=`
    SELECT 
      ${n},
      AVG(EXTRACT(EPOCH FROM (LEAD(e.timestamp) OVER (PARTITION BY e.user_id ORDER BY e.timestamp) - e.timestamp))) as avg_time_between_events
    FROM analytics_events e
    JOIN users u ON e.user_id = u.id
    WHERE u.organization_id = $1
  `,d=[e],E=1;return s&&i&&(u+=` AND e.timestamp BETWEEN $${++E} AND $${++E}`,d.push(s,i)),o.length>0&&(u+=` AND e.event_type = ANY($${++E})`,d.push(o)),u+=` GROUP BY ${a} ORDER BY event_count DESC`,(await c.db.query(u,d)).rows}async function _(e,t={}){let a;let{start_date:n,end_date:s,period:i="month",source:o=null}=t;switch(i){case"day":a="YYYY-MM-DD";break;case"week":a="IYYY-IW";break;case"month":default:a="YYYY-MM";break;case"year":a="YYYY"}let r=`
    SELECT 
      TO_CHAR(created_at, '${a}') as time_period,
      COUNT(*) as new_contacts,
      SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_contacts,
      SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_contacts,
      COUNT(DISTINCT source) as unique_sources,
      COUNT(DISTINCT tag_id) as unique_tags
    FROM contacts
    WHERE organization_id = $1
  `,u=[e],d=1;n&&s&&(r+=` AND created_at BETWEEN $${++d} AND $${++d}`,u.push(n,s)),o&&(r+=` AND source = $${++d}`,u.push(o)),r+=" GROUP BY time_period ORDER BY time_period";let E=await c.db.query(r,u),_=`
    SELECT 
      source, 
      COUNT(*) as count,
      ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM contacts WHERE organization_id = $1)), 1) as percentage
    FROM contacts
    WHERE organization_id = $1
    GROUP BY source
    ORDER BY count DESC
  `,l=await c.db.query(_,[e]),N=`
    SELECT 
      c.id as contact_id,
      c.email,
      c.name,
      COUNT(e.id) as total_interactions,
      MAX(e.timestamp) as last_interaction,
      COUNT(DISTINCT e.event_type) as interaction_types
    FROM contacts c
    LEFT JOIN analytics_events e ON c.email = e.event_data->>'email'
    WHERE c.organization_id = $1
    GROUP BY c.id, c.email, c.name
    ORDER BY total_interactions DESC
    LIMIT 100
  `,T=await c.db.query(N,[e]);return{growth:E.rows,sources:l.rows,engagement:T.rows,summary:{total_contacts:await O(e),active_contacts:await p(e),new_contacts_30d:await U(e,30),conversion_rate:await g(e)}}}async function l(e,t={}){let a;let{start_date:n,end_date:s,period:i="month",pipeline_id:o=null}=t;switch(i){case"day":a="YYYY-MM-DD";break;case"week":a="IYYY-IW";break;case"month":default:a="YYYY-MM";break;case"year":a="YYYY"}let r=`
    SELECT 
      TO_CHAR(created_at, '${a}') as time_period,
      COUNT(*) as new_deals,
      SUM(value) as total_value,
      AVG(value) as avg_deal_value,
      SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as won_deals,
      SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost_deals,
      SUM(CASE WHEN status = 'won' THEN value ELSE 0 END) as won_value,
      ROUND(SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as win_rate
    FROM deals
    WHERE organization_id = $1
  `,u=[e],d=1;n&&s&&(r+=` AND created_at BETWEEN $${++d} AND $${++d}`,u.push(n,s)),o&&(r+=` AND pipeline_id = $${++d}`,u.push(o)),r+=" GROUP BY time_period ORDER BY time_period";let E=await c.db.query(r,u),_=`
    SELECT 
      p.name as pipeline_name,
      p.id as pipeline_id,
      COUNT(d.id) as deal_count,
      SUM(d.value) as total_value,
      ROUND(AVG(d.value), 2) as avg_value,
      ROUND(SUM(CASE WHEN d.status = 'won' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(d.id), 0), 1) as win_rate
    FROM deals d
    JOIN pipelines p ON d.pipeline_id = p.id
    WHERE d.organization_id = $1
    GROUP BY p.id, p.name
    ORDER BY total_value DESC
  `,l=await c.db.query(_,[e]),N=`
    SELECT 
      s.name as stage_name,
      s.id as stage_id,
      COUNT(d.id) as deal_count,
      SUM(d.value) as total_value,
      ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(d.updated_at, CURRENT_TIMESTAMP) - d.created_at)) / 86400), 1) as avg_days_in_stage
    FROM deals d
    JOIN stages s ON d.stage_id = s.id
    WHERE d.organization_id = $1
    GROUP BY s.id, s.name
    ORDER BY s.position
  `,T=await c.db.query(N,[e]),R=`
    WITH won_deals AS (
      SELECT 
        id, 
        value, 
        EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400 as days_to_close
      FROM deals
      WHERE organization_id = $1 AND status = 'won'
      AND updated_at >= CURRENT_DATE - INTERVAL '90 days'
    )
    SELECT 
      COUNT(*) as won_deals_count,
      SUM(value) as total_won_value,
      ROUND(AVG(days_to_close), 1) as avg_days_to_close,
      ROUND(SUM(value) / NULLIF(SUM(days_to_close), 0), 2) as sales_velocity_per_day
    FROM won_deals
  `,O=await c.db.query(R,[e]);return{timeline:E.rows,pipelines:l.rows,stages:T.rows,velocity:O.rows[0],summary:{total_deals:await S(e),open_deals_value:await D(e),win_rate:await C(e),avg_deal_cycle:await m(e)}}}async function N(e,t={}){let a;let{start_date:n,end_date:s,period:i="month"}=t;switch(i){case"day":a="YYYY-MM-DD";break;case"week":a="IYYY-IW";break;case"month":default:a="YYYY-MM";break;case"year":a="YYYY"}let o=`
    SELECT 
      TO_CHAR(sent_at, '${a}') as time_period,
      COUNT(DISTINCT id) as campaigns_count,
      SUM(recipients_count) as total_recipients,
      SUM(opened_count) as total_opens,
      SUM(clicked_count) as total_clicks,
      ROUND(SUM(opened_count) * 100.0 / NULLIF(SUM(recipients_count), 0), 1) as open_rate,
      ROUND(SUM(clicked_count) * 100.0 / NULLIF(SUM(opened_count), 0), 1) as click_through_rate,
      ROUND(SUM(unsubscribed_count) * 100.0 / NULLIF(SUM(recipients_count), 0), 1) as unsubscribe_rate
    FROM email_campaigns
    WHERE organization_id = $1
  `,r=[e],u=1;n&&s&&(o+=` AND sent_at BETWEEN $${++u} AND $${++u}`,r.push(n,s)),o+=" GROUP BY time_period ORDER BY time_period";let d=await c.db.query(o,r),E=`
    SELECT 
      id,
      name,
      subject,
      recipients_count,
      opened_count,
      clicked_count,
      bounced_count,
      unsubscribed_count,
      ROUND(opened_count * 100.0 / NULLIF(recipients_count, 0), 1) as open_rate,
      ROUND(clicked_count * 100.0 / NULLIF(opened_count, 0), 1) as click_rate,
      ROUND(bounced_count * 100.0 / NULLIF(recipients_count, 0), 1) as bounce_rate,
      ROUND(unsubscribed_count * 100.0 / NULLIF(recipients_count, 0), 1) as unsubscribe_rate
    FROM email_campaigns
    WHERE organization_id = $1
    ORDER BY sent_at DESC
    LIMIT 10
  `,_=await c.db.query(E,[e]),l=`
    SELECT 
      EXTRACT(HOUR FROM opened_at) as hour_of_day,
      COUNT(*) as open_count
    FROM email_campaign_events
    WHERE organization_id = $1 AND event_type = 'open'
    GROUP BY hour_of_day
    ORDER BY hour_of_day
  `,N=await c.db.query(l,[e]),T=`
    SELECT 
      user_agent_data->>'device' as device,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (
        SELECT COUNT(*) FROM email_campaign_events 
        WHERE organization_id = $1 AND event_type = 'open'
      ), 1) as percentage
    FROM email_campaign_events
    WHERE organization_id = $1 AND event_type = 'open'
    GROUP BY device
    ORDER BY count DESC
  `,R=await c.db.query(T,[e]);return{timeline:d.rows,campaigns:_.rows,engagement_times:N.rows,devices:R.rows,summary:{total_campaigns:await y(e),avg_open_rate:await w(e),avg_click_rate:await L(e),top_performing_subject:await I(e)}}}async function T(e,t={}){let a;let{start_date:n,end_date:s,funnel_name:i="default"}=t,o=[e];return a="marketing"===i?`
      WITH funnel_stages AS (
        SELECT 
          'Visit' as stage, 
          COUNT(DISTINCT user_id) as count,
          1 as stage_order
        FROM analytics_events
        WHERE event_type = 'page_view'
        AND organization_id = $1
        
        UNION ALL
        
        SELECT 
          'Lead' as stage, 
          COUNT(DISTINCT id) as count,
          2 as stage_order
        FROM contacts
        WHERE organization_id = $1
        
        UNION ALL
        
        SELECT 
          'MQL' as stage, 
          COUNT(DISTINCT id) as count,
          3 as stage_order
        FROM contacts
        WHERE organization_id = $1
        AND lead_status = 'marketing_qualified'
        
        UNION ALL
        
        SELECT 
          'SQL' as stage, 
          COUNT(DISTINCT id) as count,
          4 as stage_order
        FROM contacts
        WHERE organization_id = $1
        AND lead_status = 'sales_qualified'
        
        UNION ALL
        
        SELECT 
          'Opportunity' as stage, 
          COUNT(DISTINCT id) as count,
          5 as stage_order
        FROM deals
        WHERE organization_id = $1
        
        UNION ALL
        
        SELECT 
          'Customer' as stage, 
          COUNT(DISTINCT id) as count,
          6 as stage_order
        FROM deals
        WHERE organization_id = $1
        AND status = 'won'
      )
      SELECT 
        stage,
        count,
        CASE 
          WHEN LAG(count) OVER (ORDER BY stage_order) IS NULL THEN 100
          ELSE ROUND(count * 100.0 / NULLIF(LAG(count) OVER (ORDER BY stage_order), 0), 1)
        END as conversion_rate,
        CASE 
          WHEN FIRST_VALUE(count) OVER (ORDER BY stage_order) = 0 THEN 0
          ELSE ROUND(count * 100.0 / NULLIF(FIRST_VALUE(count) OVER (ORDER BY stage_order), 0), 1)
        END as absolute_rate
      FROM funnel_stages
      ORDER BY stage_order
    `:`
      WITH funnel_stages AS (
        SELECT 
          s.name as stage, 
          COUNT(d.id) as count,
          s.position as stage_order
        FROM stages s
        LEFT JOIN deals d ON s.id = d.stage_id AND d.organization_id = $1
        WHERE s.pipeline_id IN (SELECT id FROM pipelines WHERE organization_id = $1)
        GROUP BY s.name, s.position
      )
      SELECT 
        stage,
        count,
        CASE 
          WHEN LAG(count) OVER (ORDER BY stage_order) IS NULL THEN 100
          ELSE ROUND(count * 100.0 / NULLIF(LAG(count) OVER (ORDER BY stage_order), 0), 1)
        END as conversion_rate,
        CASE 
          WHEN FIRST_VALUE(count) OVER (ORDER BY stage_order) = 0 THEN 0
          ELSE ROUND(count * 100.0 / NULLIF(FIRST_VALUE(count) OVER (ORDER BY stage_order), 0), 1)
        END as absolute_rate
      FROM funnel_stages
      ORDER BY stage_order
    `,{funnel_name:i,stages:(await c.db.query(a,o)).rows,conversion_summary:{top_entry_point:await v(e),biggest_drop_stage:await A(e,i),overall_conversion:await $(e,i)}}}async function R(e,t={}){let{start_date:a,end_date:n,channel:s=null}=t,i=`
    SELECT 
      m.channel,
      SUM(m.cost) as total_cost,
      COUNT(DISTINCT c.id) as leads_generated,
      COUNT(DISTINCT d.id) as opportunities_created,
      SUM(CASE WHEN d.status = 'won' THEN d.value ELSE 0 END) as revenue_generated,
      CASE 
        WHEN SUM(m.cost) = 0 THEN 0
        ELSE ROUND(SUM(CASE WHEN d.status = 'won' THEN d.value ELSE 0 END) / NULLIF(SUM(m.cost), 0), 2)
      END as roi,
      CASE 
        WHEN COUNT(DISTINCT c.id) = 0 THEN 0
        ELSE ROUND(SUM(m.cost) / NULLIF(COUNT(DISTINCT c.id), 0), 2)
      END as cost_per_lead,
      CASE 
        WHEN COUNT(DISTINCT d.id) = 0 THEN 0
        ELSE ROUND(SUM(m.cost) / NULLIF(COUNT(DISTINCT d.id), 0), 2)
      END as cost_per_opportunity
    FROM marketing_campaigns m
    LEFT JOIN contacts c ON c.source = m.channel AND c.organization_id = m.organization_id
    LEFT JOIN deals d ON d.contact_id = c.id AND d.organization_id = m.organization_id
    WHERE m.organization_id = $1
  `,o=[e],r=1;return a&&n&&(i+=` AND m.start_date >= $${++r} AND m.end_date <= $${++r}`,o.push(a,n)),s&&(i+=` AND m.channel = $${++r}`,o.push(s)),i+=" GROUP BY m.channel ORDER BY roi DESC",{channels:(await c.db.query(i,o)).rows,summary:{total_marketing_spend:await M(e,t),total_revenue_attributed:await F(e,t),overall_roi:await H(e,t),best_performing_channel:await Y(e,t)}}}async function O(e){return parseInt((await c.db.query("SELECT COUNT(*) as count FROM contacts WHERE organization_id = $1",[e])).rows[0].count,10)}async function p(e){return parseInt((await c.db.query("SELECT COUNT(*) as count FROM contacts WHERE organization_id = $1 AND status = 'active'",[e])).rows[0].count,10)}async function U(e,t){let a=new Date;return a.setDate(a.getDate()-t),parseInt((await c.db.query("SELECT COUNT(*) as count FROM contacts WHERE organization_id = $1 AND created_at >= $2",[e,a.toISOString()])).rows[0].count,10)}async function g(e){return parseFloat((await c.db.query(`
    SELECT 
      COUNT(DISTINCT d.contact_id) as converted_contacts,
      COUNT(DISTINCT c.id) as total_contacts,
      CASE 
        WHEN COUNT(DISTINCT c.id) = 0 THEN 0
        ELSE ROUND(COUNT(DISTINCT d.contact_id) * 100.0 / NULLIF(COUNT(DISTINCT c.id), 0), 1)
      END as conversion_rate
    FROM contacts c
    LEFT JOIN deals d ON c.id = d.contact_id AND d.organization_id = c.organization_id
    WHERE c.organization_id = $1
  `,[e])).rows[0].conversion_rate)}async function S(e){return parseInt((await c.db.query("SELECT COUNT(*) as count FROM deals WHERE organization_id = $1",[e])).rows[0].count,10)}async function D(e){return parseFloat((await c.db.query("SELECT SUM(value) as total FROM deals WHERE organization_id = $1 AND status = 'open'",[e])).rows[0].total||0)}async function C(e){return parseFloat((await c.db.query(`
    SELECT 
      ROUND(
        SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) * 100.0 / 
        NULLIF(COUNT(*), 0),
        1
      ) as win_rate
    FROM deals
    WHERE organization_id = $1 AND status IN ('won', 'lost')
  `,[e])).rows[0].win_rate||0)}async function m(e){return parseFloat((await c.db.query(`
    SELECT 
      ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400), 1) as avg_days
    FROM deals
    WHERE organization_id = $1 AND status = 'won'
  `,[e])).rows[0].avg_days||0)}async function y(e){return parseInt((await c.db.query("SELECT COUNT(*) as count FROM email_campaigns WHERE organization_id = $1",[e])).rows[0].count,10)}async function w(e){return parseFloat((await c.db.query(`
    SELECT 
      ROUND(
        SUM(opened_count) * 100.0 / NULLIF(SUM(recipients_count), 0),
        1
      ) as avg_open_rate
    FROM email_campaigns
    WHERE organization_id = $1
  `,[e])).rows[0].avg_open_rate||0)}async function L(e){return parseFloat((await c.db.query(`
    SELECT 
      ROUND(
        SUM(clicked_count) * 100.0 / NULLIF(SUM(opened_count), 0),
        1
      ) as avg_click_rate
    FROM email_campaigns
    WHERE organization_id = $1
  `,[e])).rows[0].avg_click_rate||0)}async function I(e){let t=await c.db.query(`
    SELECT 
      subject,
      ROUND(opened_count * 100.0 / NULLIF(recipients_count, 0), 1) as open_rate
    FROM email_campaigns
    WHERE organization_id = $1 AND recipients_count >= 10
    ORDER BY open_rate DESC
    LIMIT 1
  `,[e]);return t.rows[0]?t.rows[0].subject:null}async function v(e){let t=await c.db.query(`
    SELECT 
      source,
      COUNT(*) as count
    FROM contacts
    WHERE organization_id = $1
    GROUP BY source
    ORDER BY count DESC
    LIMIT 1
  `,[e]);return t.rows[0]?t.rows[0].source:null}async function A(e,t){return"Lead to MQL"}async function $(e,t){return 2.5}async function M(e,t){let{start_date:a,end_date:n,channel:s=null}=t,i="SELECT SUM(cost) as total FROM marketing_campaigns WHERE organization_id = $1",o=[e],r=1;return a&&n&&(i+=` AND start_date >= $${++r} AND end_date <= $${++r}`,o.push(a,n)),s&&(i+=` AND channel = $${++r}`,o.push(s)),parseFloat((await c.db.query(i,o)).rows[0].total||0)}async function F(e,t){let{start_date:a,end_date:n,channel:s=null}=t,i=`
    SELECT SUM(d.value) as total
    FROM deals d
    JOIN contacts c ON d.contact_id = c.id
    WHERE d.organization_id = $1 AND d.status = 'won'
  `,o=[e],r=1;return a&&n&&(i+=` AND d.created_at >= $${++r} AND d.created_at <= $${++r}`,o.push(a,n)),s&&(i+=` AND c.source = $${++r}`,o.push(s)),parseFloat((await c.db.query(i,o)).rows[0].total||0)}async function H(e,t){let a=await M(e,t),n=await F(e,t);return 0===a?0:parseFloat((n/a).toFixed(2))}async function Y(e,t){let{start_date:a,end_date:n}=t,s=`
    SELECT 
      m.channel,
      CASE 
        WHEN SUM(m.cost) = 0 THEN 0
        ELSE ROUND(SUM(CASE WHEN d.status = 'won' THEN d.value ELSE 0 END) / NULLIF(SUM(m.cost), 0), 2)
      END as roi
    FROM marketing_campaigns m
    LEFT JOIN contacts c ON c.source = m.channel AND c.organization_id = m.organization_id
    LEFT JOIN deals d ON d.contact_id = c.id AND d.organization_id = m.organization_id
    WHERE m.organization_id = $1
  `,i=[e],o=1;a&&n&&(s+=` AND m.start_date >= $${++o} AND m.end_date <= $${++o}`,i.push(a,n)),s+=" GROUP BY m.channel ORDER BY roi DESC LIMIT 1";let r=await c.db.query(s,i);return r.rows[0]?r.rows[0].channel:null}var h=a(9151);async function b(e){try{let t=(0,h.mk)(e);if(!t)return r.Z.json({error:"Authentication required"},{status:401});let{pathname:a}=new URL(e.url),{searchParams:n}=new URL(e.url),s=n.get("start_date")||null,i=n.get("end_date")||null,o=n.get("period")||"month",c=n.get("group_by")||null;if(a.includes("/contacts")){let e=n.get("source")||null,a=await _(t,{start_date:s,end_date:i,period:o,source:e});return r.Z.json({stats:a})}if(a.includes("/deals")){let e=n.get("pipeline_id")||null,a=await l(t,{start_date:s,end_date:i,period:o,pipeline_id:e});return r.Z.json({stats:a})}if(a.includes("/email-campaigns")){let e=await N(t,{start_date:s,end_date:i,period:o});return r.Z.json({stats:e})}if(a.includes("/funnel")){let e=n.get("funnel_name")||"default",a=await T(t,{start_date:s,end_date:i,funnel_name:e});return r.Z.json({stats:a})}else if(a.includes("/roi")){let e=n.get("channel")||null,a=await R(t,{start_date:s,end_date:i,channel:e});return r.Z.json({stats:a})}else if(a.includes("/organization")){let e=n.get("event_types")?n.get("event_types").split(","):[],a=await E(t,{startDate:s,endDate:i,eventTypes:e,groupBy:c});return r.Z.json({stats:a})}else if(a.includes("/user-activity")){let t=(0,h.n5)(e);if(!t)return r.Z.json({error:"User ID required"},{status:400});let a=await d(t,{startDate:s,endDate:i,groupBy:c});return r.Z.json({stats:a})}else{let[e,a,n,c,u]=await Promise.all([_(t,{start_date:s,end_date:i,period:o}),l(t,{start_date:s,end_date:i,period:o}),N(t,{start_date:s,end_date:i,period:o}),T(t,{start_date:s,end_date:i}),R(t,{start_date:s,end_date:i})]);return r.Z.json({contacts:e,deals:a,emailCampaigns:n,funnel:c,roi:u,lastUpdated:new Date().toISOString()})}}catch(e){return console.error("Get analytics error:",e),r.Z.json({error:"Failed to retrieve analytics data"},{status:500})}}async function f(e){try{let t=(0,h.mk)(e),a=(0,h.n5)(e);if(!t||!a)return r.Z.json({error:"Authentication required"},{status:401});let{event_type:n,event_data:s={},source:i=null,campaign:o=null}=await e.json();if(!n)return r.Z.json({error:"Event type is required"},{status:400});let c=await u(a,n,s,i,o);return r.Z.json({message:"Event tracked successfully",event:c})}catch(e){return console.error("Track event error:",e),r.Z.json({error:"Failed to track event"},{status:500})}}let W=new s.AppRouteRouteModule({definition:{kind:i.x.APP_ROUTE,page:"/api/analytics/route",pathname:"/api/analytics",filename:"route",bundlePath:"app/api/analytics/route"},resolvedPagePath:"/home/ubuntu/marketingsoftware/marketingsoftware-main/src/app/api/analytics/route.js",nextConfigOutput:"standalone",userland:n}),{requestAsyncStorage:q,staticGenerationAsyncStorage:B,serverHooks:z,headerHooks:k,staticGenerationBailout:j}=W,P="/api/analytics/route";function x(){return(0,o.patchFetch)({serverHooks:z,staticGenerationAsyncStorage:B})}},9151:(e,t,a)=>{function n(e){return e.headers.get("x-user-id")}function s(e){return e.headers.get("x-organization-id")}a.d(t,{mk:()=>s,n5:()=>n}),a(8070),a(7439),a(5813)},5813:(e,t,a)=>{a.d(t,{Oe:()=>r,RA:()=>c,WX:()=>u,c_:()=>o});var n=a(6521),s=a(6082);a(8046);let i=process.env.JWT_SECRET||"your-secret-key";async function o(e){return(0,n.hash)(e,10)}async function r(e,t){return(0,n.compare)(e,t)}function c(e,t="7d"){return(0,s.sign)(e,i,{expiresIn:t})}function u(e){try{return(0,s.verify)(e,i)}catch(e){return null}}},8046:(e,t,a)=>{a.d(t,{db:()=>o});var n=a(5900),s=a(4107);let i=new n.Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:!1},max:20,idleTimeoutMillis:3e4,connectionTimeoutMillis:2e3});i.on("connect",()=>{console.log("Database connection established")}),i.on("error",e=>{console.error("Unexpected database error:",e)});let o={async query(e,t=[]){let a=await i.connect();try{let n=Date.now(),s=await a.query(e,t),i=Date.now()-n;return i>100&&console.log("Slow query:",{text:e,duration:i,rows:s.rowCount}),s}catch(e){(0,s.dy)(e)}finally{a.release()}},async transaction(e){let t=await i.connect();try{await t.query("BEGIN");let a=await e(t);return await t.query("COMMIT"),a}catch(e){await t.query("ROLLBACK"),(0,s.dy)(e)}finally{t.release()}},async insert(e,t){let a=Object.keys(t),n=Object.values(t),s=a.map((e,t)=>`$${t+1}`).join(", "),i=a.join(", "),o=`
      INSERT INTO ${e} (${i})
      VALUES (${s})
      RETURNING *
    `;return(await this.query(o,n)).rows[0]},async update(e,t,a){let n=Object.keys(a),s=Object.values(a),i=n.map((e,t)=>`${e} = $${t+1}`).join(", "),o=`
      UPDATE ${e}
      SET ${i}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${n.length+1}
      RETURNING *
    `;return(await this.query(o,[...s,t])).rows[0]},async findWithPagination(e,t={},a={}){let{page:n=1,limit:s=20,orderBy:i="created_at",order:o="DESC",fields:r="*"}=a,c=Object.keys(t),u=Object.values(t),d="";c.length>0&&(d="WHERE "+c.map((e,t)=>null===u[t]?`${e} IS NULL`:`${e} = $${t+1}`).join(" AND "));let E=`
      SELECT COUNT(*) as total
      FROM ${e}
      ${d}
    `,_=`
      SELECT ${r}
      FROM ${e}
      ${d}
      ORDER BY ${i} ${o}
      LIMIT ${s} OFFSET ${(n-1)*s}
    `,[l,N]=await Promise.all([this.query(E,u),this.query(_,u)]),T=parseInt(l.rows[0].total);return{data:N.rows,pagination:{page:Number(n),limit:Number(s),total:T,pages:Math.ceil(T/s)}}},async end(){await i.end(),console.log("Database connection pool has ended")}}},4107:(e,t,a)=>{a.d(t,{dR:()=>s,dy:()=>i,p8:()=>n}),a(8070);class n extends Error{constructor(e){super(e),this.name="ValidationError",this.code="VALIDATION_ERROR"}}class s extends Error{constructor(e="Resource"){super(`${e} not found`),this.name="NotFoundError",this.code="NOT_FOUND"}}function i(e){if(console.error("Database error:",e),"23505"===e.code)throw new n("A record with this information already exists");if("23503"===e.code)throw new n("Referenced record does not exist");if("42P01"===e.code)throw Error("Database schema issue: Table does not exist");throw Error("Database operation failed")}}};var t=require("../../../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),n=t.X(0,[1638,6206,7145,7439],()=>a(2070));module.exports=n})();