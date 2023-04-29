import requests
from bs4 import BeautifulSoup
import spacy
from collections import Counter
import re

nlp = spacy.load('en_core_web_sm')

def GetReviews(url):
    count = 0
    data = []
    page_number = 1
    reviewCount = 1

    while True:

        url = url + str(page_number)
        response = requests.get(url)
        soup = BeautifulSoup(response.content, 'html.parser')

        reviews = soup.find_all("div", {"class", "_27M-vq"})

        for item in reviews:
            title_div = item.find("p", {"class", "_2-N8zT"})

            desc_main_div = item.find("div", {"class", "t-ZTKy"})
            description = desc_main_div.find("div", {"class", ""})
            rating = item.find("div", { "class", "_1BLPMq" })
            if len(rating)>0:
                rating = re.findall(r'\d+', rating.text)[0]
            else:
                rating =""
            content = {
                "id": reviewCount,
                "rating": rating,
                "title": title_div.text,
                "description": description.text.strip(),
            }
            reviewCount+=1
            data.append(content)
        next_page = soup.find('a', {'class': '_1LKTO3'})
        if not next_page or count == 4:
            break
        count += 1
        page_number += 1

    # print(data)
    relevant_tags= []

    for tag_element in data:
        doc = nlp(tag_element['description'])
        for token in doc:
            if token.pos_ == 'NOUN':
                relevant_tags.append(token)

        #     print(token.text, token.pos_, token.dep_)
        # for ent in doc.ents:
        #     print(ent.label_)
        # if any(ent.label_ == 'NOUN' for ent in doc.ents):
        #     print(ent)

    # count the frequency of each relevant tag
    # print(relevant_tags)
    tag_counts = Counter(relevant_tags)

    # find the most common relevant tags
    most_common_tags = tag_counts.most_common(15)

    dict = {}
    # print("The 10 most common relevant tags are:")
    for tag, count in most_common_tags:
        dict[str(tag)] = []

    for obj in data:
        for key in dict:
            if key in obj['description']:
                dict[key].append(obj['id'])

    # print(dict)
    return { "filteredData": dict, "data": data }


