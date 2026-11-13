import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { createProductionEdgeHandler } from "../../../lib/productionEdge.ts";
Deno.serve(createProductionEdgeHandler(name=>Deno.env.get(name),(url,key)=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})));
