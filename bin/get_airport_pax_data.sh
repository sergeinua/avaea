for i in \
	http://www.anna.aero/wp-content/uploads/european-airports.xls \
	http://www.anna.aero/wp-content/uploads/american-airport-traffic-trends.xls \
	http://www.anna.aero/wp-content/uploads/row-airports-database.xls; do 
	mkdir -p tmp
	pushd tmp
	if /usr/bin/wget $i 2>/dev/null; then
		basename=`echo $i | /bin/sed -r 's;^.+/([^/]+).xls$;\1;'`
		if [ -n "$basename" ]; then
			if /usr/bin/ssconvert -S $basename.xls $basename.csv 2>/dev/null; then
				pax_file=`/bin/egrep -l '"Pax 2014",.+,"Pax 2015"' $basename.csv.* | head -n 1`
				if [ -n "$pax_file" ]; then
					mv $pax_file ../
				else
					echo "Cannot find pax file for $basename"
				fi
				rm *.* 
			else
				echo "/usr/bin/ssconvert -S $basename.xls $basename.csv failed"
			fi
		else
			echo "Cannot find the base name for $i"
		fi
	else
		echo "Cannot wget $i"
	fi
	popd
done

