import requests
from bs4 import BeautifulSoup

base_url = 'https://imgflip.com/memetemplates?sort=top-all-time'

# Send an HTTP request and get the page content
response = requests.get(base_url)

soup = BeautifulSoup(response.text, 'html.parser')

# iframe = soup.find('iframe')

# # Extract the src attribute from the iframe
# map_url = iframe['src']
