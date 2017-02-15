/* 
use with --tuples-only option 
COPY(...) TO STDOUT does not work well because of the quotes
TODO: change the script to insert NEW records from the new table
*/ 
SELECT
   'UPDATE airports SET iata_3code=iata_3code '||
   (CASE WHEN ((a_new.name IS NOT NULL) AND coalesce(a_old.name,'')!=coalesce(a_new.name,'')) THEN
   	 E',name=E\''||replace(a_new.name,E'\'',E'\\\'')||E'\' /*was '||coalesce(a_old.name,'')||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.pax IS NOT NULL) AND coalesce(a_old.pax,0)!=coalesce(a_new.pax,0)) THEN
   	 ',pax='||a_new.pax||' /*was '||coalesce(a_old.pax,0)||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.neighbors IS NOT NULL) AND coalesce(a_old.neighbors,'')!=coalesce(a_new.neighbors,'')) THEN
   	 E',neighbors=\''||replace(a_new.neighbors,E'\'',E'\\\'')||E'\' /*was '||coalesce(a_old.neighbors,'')||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.city IS NOT NULL) AND coalesce(a_old.city,'')!=coalesce(a_new.city,'')) THEN
   	 E',city=\''||replace(a_new.city,E'\'',E'\\\'')||E'\' /*was '||coalesce(a_old.city,'')||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.state IS NOT NULL) AND coalesce(a_old.state,'')!=coalesce(a_new.state,'')) THEN
   	 E',state=\''||replace(a_new.state,E'\'',E'\\\'')||E'\' /*was '||coalesce(a_old.state,'')||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.state_short IS NOT NULL) AND coalesce(a_old.state_short,'')!=coalesce(a_new.state_short,'')) THEN
   	 E',state_short=\''||replace(a_new.state_short,E'\'',E'\\\'')||E'\' /*was '||coalesce(a_old.state_short,'')||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.longitude IS NOT NULL) AND coalesce(a_old.longitude||'','')!=coalesce(a_new.longitude||'','')) THEN
   	 ',longitude='||a_new.longitude||' /*was '||coalesce(a_old.longitude,0)||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.latitude IS NOT NULL) AND coalesce(a_old.latitude||'','')!=coalesce(a_new.latitude||'','')) THEN
   	 ',latitude='||a_new.latitude||' /*was '||coalesce(a_old.latitude,0)||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.altitude IS NOT NULL) AND coalesce(a_old.altitude||'','')!=coalesce(a_new.altitude||'','')) THEN
   	 ',altitude='||a_new.altitude||' /*was '||coalesce(a_old.altitude,0)||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.alternative_name IS NOT NULL) AND coalesce(a_old.alternative_name,'')!=coalesce(a_new.alternative_name,'')) THEN
   	 E',alternative_name=\''||replace(a_new.alternative_name,E'\'',E'\\\'')||E'\' /*was '||coalesce(a_old.alternative_name,'')||'*/ ' ELSE '' END)||
   E'WHERE iata_3code=\''||a_old.iata_3code||E'\';'
FROM
   airports a_old
   INNER JOIN airports9 a_new ON (a_old.iata_3code=a_new.iata_3code)
WHERE
   ((a_new.name IS NOT NULL) AND coalesce(a_old.name,'')!=coalesce(a_new.name,'')) OR
   ((a_new.pax IS NOT NULL) AND coalesce(a_old.pax,0)!=coalesce(a_new.pax,0)) OR
   ((a_new.neighbors IS NOT NULL) AND coalesce(a_old.neighbors,'')!=coalesce(a_new.neighbors,'')) OR
   ((a_new.city IS NOT NULL) AND coalesce(a_old.city,'')!=coalesce(a_new.city,'')) OR
   ((a_new.state IS NOT NULL) AND coalesce(a_old.state,'')!=coalesce(a_new.state,'')) OR
   ((a_new.state_short IS NOT NULL) AND coalesce(a_old.state_short,'')!=coalesce(a_new.state_short,'')) OR
   ((a_new.longitude IS NOT NULL) AND coalesce(a_old.longitude||'','')!=coalesce(a_new.longitude||'','')) OR
   ((a_new.latitude IS NOT NULL) AND coalesce(a_old.latitude||'','')!=coalesce(a_new.latitude||'','')) OR
   ((a_new.altitude IS NOT NULL) AND coalesce(a_old.altitude||'','')!=coalesce(a_new.altitude||'','')) OR
   ((a_new.alternative_name IS NOT NULL) AND coalesce(a_old.alternative_name,'')!=coalesce(a_new.alternative_name,''))
;
