#!/bin/bash

host="localhost"

declare -a recipients
recipients=( "valentine.kaminskiy@gmail.com" "monitoring@avaea.com" )

results=()

declare -A email_tpl

email_tpl[to]="To: "
email_tpl[from]="From: abaea.monitoring@gmail.com"
email_tpl[subject]="Subject: Aveea server alert"

# Dictionary port and port description
declare -a ports

ports=( ["8000"]="8000 - Production web interface"
        ["8080"]="8080 - Production backend web interface"
        ["9000"]="9000 - Staging web interface"
        ["9090"]="9090 - Staging backend web interface" )


# Collecting check results
for port in "${!ports[@]}";
do
    echo "Starting check for ${ports["$port"]}."

    ret_code=$(curl -s -o /dev/null -I -w "%{http_code}" "$host:$port");

    if [ "$ret_code" = "200" ]
    then
	echo "Check for ${ports["$port"]} PASSED."
    else
	results+=( $port )
        msg="Check for ${ports["$port"]} FAILED."
        email_body+="$msg"$'\n'
        echo "$msg"
    fi

done

# Processing check results

if [ ${#results[@]} -eq 0 ]; then
    echo "No errors, hooray"
    exit 0
else
    echo "Something went wrong."
    echo "Sending error report for recipients..."

    curr_time=$(date -u)

    for recipient in "${recipients[@]}";
    do
        echo "${email_tpl[to]}$recipient" > ./email.txt
        echo "${email_tpl[from]}" >> ./email.txt
        echo "${email_tpl[subject]}"$'\n' >> ./email.txt

        echo "$curr_time" >> ./email.txt
        echo "$email_body" >> ./email.txt

        ssmtp "$recipient" < ./email.txt

    done

    unlink ./email.txt

    exit 1
fi
