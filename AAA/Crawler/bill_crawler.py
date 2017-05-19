from bs4 import BeautifulSoup
import requests
import urllib.request
import csv

url_base = "http://pokr.kr/bill/"
api_front_base = "http://api.popong.com/v0.1/bill/"
api_end_base = "?api_key=test"

i=0
representative = ""
proposer_list =list()

# Create csv file
with open('bills.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile, delimiter=',')
    # Create csv header
    writer.writerow(["id","bill_name", "date", "representative_proposer", "proposer", "status", "summary"])
    # From bill number 1900001 to 1918652
    for number in range(1900001, 1918653):
        try:
            print(number)
            # Get info from api
            api = requests.get(api_front_base+str(number)+api_end_base).json()
            # Get rest info by crawling
            r = urllib.request.urlopen(url_base+str(number)).read()
            bill_id = "/bill/" + str(number)
            soup = BeautifulSoup(r, 'html.parser')
            # Find all people info from html
            people = soup.find_all('div', {"class" : "person-name text-center"})
            # People information
            for name in people:
                if (i==0):
                    # Frist person is represnetative
                    representative = name.text.replace('\n','')
                    i+=1
                else:
                    proposer_list.append(name.text.replace('\n',''))
            # Write info to csv file
            writer.writerow([number,api["name"], api["proposed_date"], representative, proposer_list, api["status"], api["summary"]])
            # Initialize variables
            i = 0
            representative = ""
            proposer_list.clear()
        except:
            pass

