import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { createZohoEdgeHandler } from "../../../lib/zohoEdge.ts";
Deno.serve(createZohoEdgeHandler(name=>Deno.env.get(name),(url,key)=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})));
