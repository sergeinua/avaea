COPY (SELECT
   'UPDATE airports SET iata_3code=iata_3code'||
   (CASE WHEN ((a_new.pax IS NOT NULL) AND coalesce(a_old.pax,0)!=coalesce(a_new.pax,0)) THEN
   	 ',pax='||a_new.pax||' /*was '||coalesce(a_old.pax,0)||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.neighbors IS NOT NULL) AND coalesce(a_old.neighbors,'')!=coalesce(a_new.neighbors,'')) THEN
   	 E',neighbors=\''||a_new.neighbors||E'\' /*was '||coalesce(a_old.neighbors,'')||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.city IS NOT NULL) AND coalesce(a_old.city,'')!=coalesce(a_new.city,'')) THEN
   	 E',city=\''||a_new.city||E'\' /*was '||coalesce(a_old.city,'')||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.state IS NOT NULL) AND coalesce(a_old.state,'')!=coalesce(a_new.state,'')) THEN
   	 E',state=\''||a_new.state||E'\' /*was '||coalesce(a_old.state,'')||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.state_short IS NOT NULL) AND coalesce(a_old.state_short,'')!=coalesce(a_new.state_short,'')) THEN
   	 E',state_short=\''||a_new.state_short||E'\' /*was '||coalesce(a_old.state_short,'')||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.longitude IS NOT NULL) AND coalesce(a_old.longitude,0)!=coalesce(a_new.longitude,0)) THEN
   	 ',longitude='||a_new.longitude||' /*was '||coalesce(a_old.longitude,0)||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.latitude IS NOT NULL) AND coalesce(a_old.latitude,0)!=coalesce(a_new.latitude,0)) THEN
   	 ',latitude='||a_new.latitude||' /*was '||coalesce(a_old.latitude,0)||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.altitude IS NOT NULL) AND coalesce(a_old.altitude,0)!=coalesce(a_new.altitude,0)) THEN
   	 ',altitude='||a_new.altitude||' /*was '||coalesce(a_old.altitude,0)||'*/ ' ELSE '' END)||
   (CASE WHEN ((a_new.alternative_name IS NOT NULL) AND coalesce(a_old.alternative_name,'')!=coalesce(a_new.alternative_name,'')) THEN
   	 E',alternative_name=\''||a_new.alternative_name||E'\' /*was '||coalesce(a_old.alternative_name,'')||'*/ ' ELSE '' END)||
   E'WHERE iata_3code=\''||a_old.iata_3code||E'\';'
FROM
   airports a_old
   INNER JOIN airports9 a_new ON (a_old.iata_3code=a_new.iata_3code)
WHERE
   ((a_new.pax IS NOT NULL) AND coalesce(a_old.pax,0)!=coalesce(a_new.pax,0)) OR
   ((a_new.neighbors IS NOT NULL) AND coalesce(a_old.neighbors,'')!=coalesce(a_new.neighbors,'')) OR
   ((a_new.city IS NOT NULL) AND coalesce(a_old.city,'')!=coalesce(a_new.city,'')) OR
   ((a_new.state IS NOT NULL) AND coalesce(a_old.state,'')!=coalesce(a_new.state,'')) OR
   ((a_new.state_short IS NOT NULL) AND coalesce(a_old.state_short,'')!=coalesce(a_new.state_short,'')) OR
   ((a_new.longitude IS NOT NULL) AND coalesce(a_old.longitude,0)!=coalesce(a_new.longitude,0)) OR
   ((a_new.latitude IS NOT NULL) AND coalesce(a_old.latitude,0)!=coalesce(a_new.latitude,0)) OR
   ((a_new.altitude IS NOT NULL) AND coalesce(a_old.altitude,0)!=coalesce(a_new.altitude,0)) OR
   ((a_new.alternative_name IS NOT NULL) AND coalesce(a_old.alternative_name,'')!=coalesce(a_new.alternative_name,''))
) TO STDOUT;
