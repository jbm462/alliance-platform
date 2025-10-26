"use strict";(()=>{var e={};e.id=563,e.ids=[563],e.modules={2885:e=>{e.exports=require("@supabase/supabase-js")},1649:e=>{e.exports=require("next-auth/react")},145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},6555:e=>{e.exports=import("uuid")},5911:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{config:()=>l,default:()=>c,routeModule:()=>u});var o=a(1802),i=a(7153),s=a(6249),n=a(970),d=e([n]);n=(d.then?(await d)():d)[0];let c=(0,s.l)(n,"default"),l=(0,s.l)(n,"config"),u=new o.PagesAPIRouteModule({definition:{kind:i.x.PAGES_API,page:"/api/service-catalog",pathname:"/api/service-catalog",bundlePath:"",filename:""},userland:n});r()}catch(e){r(e)}})},678:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.d(t,{U:()=>createServiceCatalogWorkflow});var o=a(6555),i=a(9492),s=e([o]);o=(s.then?(await s)():s)[0];let createServiceCatalogWorkflow=async(e,t="Banking")=>{try{let a=(0,o.v4)(),r=new Date().toISOString(),{error:s}=await i.O.from("workflows").insert({id:a,title:`Service Catalog - ${t}`,description:`A comprehensive workflow for developing a service catalog for ${t} organizations, leveraging APQC taxonomy and AI-driven analysis.`,author_id:e,created_at:r,updated_at:r,version:"1.0",version_notes:"Initial version",is_public:!1,category:"service_catalog"});if(s)throw s;let n=[{id:(0,o.v4)(),workflow_id:a,order_index:0,type:"human",label:"Upload APQC/Base Taxonomy",instructions:"Upload an Excel or CSV file containing the APQC taxonomy or other process framework you want to use as a base for your service catalog.",created_at:r,updated_at:r},{id:(0,o.v4)(),workflow_id:a,order_index:1,type:"ai",label:"Extract and Structure Taxonomy",system_prompt:"You are an expert in business process frameworks and taxonomies. Your task is to analyze the provided data and extract a structured process taxonomy.",user_prompt:`Extract and structure the process taxonomy from the following data:
{{taxonomyData}}

Format as hierarchical JSON with:
- L1: Major process areas
- L2: Process groups  
- L3: Processes
- L4: Activities

Include APQC codes where present. Make sure to preserve the hierarchical relationships between levels.`,created_at:r,updated_at:r},{id:(0,o.v4)(),workflow_id:a,order_index:2,type:"human",label:"Review and Request Client Data",instructions:"Review the structured taxonomy extracted by AI. Make any necessary corrections or adjustments. When ready, request additional data from the client to enrich the taxonomy.",created_at:r,updated_at:r},{id:(0,o.v4)(),workflow_id:a,order_index:3,type:"client_validate",label:"Client Data Upload",instructions:"Please upload any relevant documents to help us understand your specific processes. This could include time studies, organization charts, existing process documentation, or other relevant materials.",created_at:r,updated_at:r},{id:(0,o.v4)(),workflow_id:a,order_index:4,type:"ai",label:"Enrich with Intelligence",system_prompt:"You are an expert business process consultant with deep expertise in service catalog development and operational optimization.",user_prompt:`Based on the process taxonomy and client data:

1. Add time estimates per process (from client data or industry benchmarks for {{category}} if client data is not available)
2. Add complexity scores (1-5 scale) based on process characteristics
3. Add volume indicators (high/medium/low) based on typical transaction volumes in {{category}}
4. Suggest delivery model for each process: Retain/CoE/BPO/Offshore/Automate
5. For each suggestion, provide a brief explanation of your reasoning

Process Taxonomy:
{{structuredTaxonomy}}

Client Data:
{{clientData}}

Please provide your recommendations in a structured JSON format that maintains the hierarchy of the taxonomy.`,created_at:r,updated_at:r},{id:(0,o.v4)(),workflow_id:a,order_index:5,type:"human",label:"Strategic Review",instructions:"Review the AI-enriched taxonomy and delivery model recommendations. Provide strategic insights, override recommendations as needed, and add any additional context based on your expertise.",created_at:r,updated_at:r},{id:(0,o.v4)(),workflow_id:a,order_index:6,type:"ai",label:"Generate Deliverable",system_prompt:"You are an expert at creating professional business presentations and reports.",user_prompt:`Create a comprehensive service catalog deliverable based on the enriched taxonomy and strategic insights. The deliverable should include:

1. Executive summary highlighting key findings and recommendations
2. Full taxonomy with delivery model recommendations
3. Implementation roadmap with prioritized initiatives
4. Strategic considerations and next steps

Enriched Taxonomy:
{{enrichedTaxonomy}}

Strategic Insights:
{{strategicInsights}}

Format the output as a professional report suitable for executive presentation.`,created_at:r,updated_at:r}],{error:d}=await i.O.from("workflow_steps").insert(n);if(d)throw d;return{workflowId:a,steps:n}}catch(e){throw console.error("Error creating service catalog workflow:",e),e}};r()}catch(e){r(e)}})},9492:(e,t,a)=>{a.d(t,{O:()=>s});var r=a(2885);let o="https://rpudkaqdoguytyweytww.supabase.co",i="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwdWRrYXFkb2d1eXR5d2V5dHd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxNDI3NTMsImV4cCI6MjA2MzcxODc1M30.GWu-jUQXMU94kTuGx9aK5aG_xNVjJFq9lbrcLUW8HBA";if(!o||!i)throw Error("Missing Supabase environment variables");let s=(0,r.createClient)(o,i)},970:(e,t,a)=>{a.a(e,async(e,r)=>{try{a.r(t),a.d(t,{default:()=>handler});var o=a(1649),i=a(678),s=e([i]);async function handler(e,t){if("POST"!==e.method)return t.status(405).json({message:"Method not allowed"});let a=await (0,o.getSession)({req:e});if(!a||!a.user?.id)return t.status(401).json({message:"Unauthorized"});try{let{category:r}=e.body;if(!r)return t.status(400).json({message:"Category is required"});let o=await (0,i.U)(a.user.id,r);return t.status(201).json({message:"Service catalog workflow created successfully",workflowId:o.workflowId})}catch(e){return console.error("Error creating service catalog workflow:",e),t.status(500).json({message:"Failed to create service catalog workflow"})}}i=(s.then?(await s)():s)[0],r()}catch(e){r(e)}})}};var t=require("../../webpack-api-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),a=t.X(0,[222],()=>__webpack_exec__(5911));module.exports=a})();