# Assembly Activity Analysis
* Team A3 - HCI project 2017 김재영/김영택
* https://snuhci2017.github.io/AAA/main.html?

## Background / Goal
![A3 background](http://snuhci2017.github.io/AAA/report/background.png)

**객관적/정량적 데이터를 바탕으로 합리적 투표권 행사**
 - 공개 국회의원 의안 데이터를 분석 -> 효과적 Visualization/Interaction을 통해 의사 결정 지원
![A3 Project Concept](http://snuhci2017.github.io/AAA/report/concept.png)

## Related work
![A3 relatedwork](http://snuhci2017.github.io/AAA/report/relatedwork.png)

## Persona
![A3 persona](http://snuhci2017.github.io/AAA/report/persona.png)
** Primary Persona Description **
* 김재민씨는 정치에 깊은 관심을 가지고 있는 유권자이다. 그는 

** Second Persona Description **
* 박성현씨는 이번 총선이 생애 2번째 투표 참여이다. 그는 저번 총선에서 그냥 인상이 좋은 후보를 뽑았지만 지난 총선에서 자신이 뽑은 국회의원이 지역구에 별다른 이익을 가져다 주지 않아 실제로 그가 지난 4년간 의정활동을 열심히 하였는지 의문이다.
성현씨는 이번 총선에서 자신과 지역구에 이익이 되는 국회의원을 뽑고자 하지만 경험도, 참고할만한 자료도 없어서 의사결정이 어렵기만하다.

## UI Layout / Flow
### UI Component
![A3 layout](http://snuhci2017.github.io/AAA/report/layout.png)
* Ranking Pane
 : 이건 어떤 역할/기능을 하고, 이걸 넣은건 HCI 적으로 어떻기 때문에 넣었따...
* Detail Pane
* GeoMap
* Weight RadarChart
* Selected List
* Bill Sum (Stacked bar + accumulated line chart)
* Detail Bars
* Guage

### Visual Seeking Mantra에 따른 Flow
![A3 Seeking Mantra](http://snuhci2017.github.io/AAA/report/mantra.png)

## Virtual Scenario
* 박자민 씨는 지난 19대 대선 투표에서,생애 첫 투표라서 포스터의 이미지만 보고 투표를 했고, 그 후보가 당첨이 되었다. 최근 최순실 사태로 정치에 대한 관심이 부쩍 높아진 그는, 자신의 그간 투표가 정말 제대로 쓸모가 있었는지 다시 돌아보게 되었고, 생애 첫 투표였던 19대 대선 투표 결과에 대해서 검증을 하길 원했다.
* A3에 접속한 그는, 일단 내가 투표한 사람이 누구였던지 확인하기 위해 *geomap에 자신의 선거구 위에 마우스를 올려보고*, "이상규" 임을 확인한다.
* 이상규 의원이 매우 낮은 점수임을 확인하고, *자신의 criteria weight를 좀 더 상세하게 조절*하여(의안 통과율, 예산집행률의 비율 등을 높임) 봤으나 여전히 낮은 랭킹임을 확인한다.
* 랭킹 테이블의 *이상규 의원을 클릭하여 아래 detail pane에서 상세 정보를 확인*한다.
* 그럼, 정말 열심히 일한 국회의원이 누군인지, 자기가 맘에 들게 일한 의원이 누구인지 확인해보고 싶어서, *weight를 다시 조절해서 상위 랭킹을 확인*한다.
* 상위랭커들의 상세 정보와 이상규 의원과의 비교를 통해 정보의 차이를 확인하고, 정말 열심히 일하는 국회의원들이 어떤 사람인지를 다시 한번 확인하여 다음 투표 때 꼭 그 사람을 뽑도록 노력할 것이다.

## Pilot Study
![A3 pilotstudy](http://snuhci2017.github.io/AAA/report/pilotstudy.png)

## Contribution
![A3 contribution](http://snuhci2017.github.io/AAA/report/contribution.png)

## Future work
- Contribution to Popong하고, 기회가 되면 Collaboration 해보고 싶다.
- 의안 정보의 추가 가공
    - Text mining을 통한 의안 자체의 topic(성향)분석
- Data Dimension 추가 확보
    - 지역구 확대(전국)
    - E.g. 공약 이행률 등
