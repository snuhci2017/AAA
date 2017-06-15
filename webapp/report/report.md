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
**Primary Persona Description**
* 김재민씨는 정치에 깊은 관심을 가지고 있는 유권자이다. 그는 투표의 중요성을 이해하고 실제 의정기록 및 다양한 자료들을 바탕으로 의정활동을 열심히 할 것 같은 국회의원을 뽑고자 한다. 판단을 위해 그는 국회의안정보 사이트를 방문했지만 낮은 데이터 접근성때문에 어떤 데이터를 보고 의사결정을 해야하는지 잘 감이 잡히지 않았다.

**Second Persona Description**
* 박성현씨는 이번 총선이 생애 2번째 투표 참여이다. 그는 저번 총선에서 그냥 인상이 좋아보이는 후보를 뽑았지만 지난 총선에서 자신이 뽑은 국회의원이 지역구에 별다른 이익을 가져다 주지 않아 실제로 그가 지난 4년간 의정활동을 열심히 하였는지 의문이다.
성현씨는 이번 총선에서 자신과 지역구에 이익이 되는 국회의원을 뽑고자 하지만 경험도, 참고할만한 자료도 없어서 의사결정이 어렵기만하다.

## UI Layout / Flow
### UI Component
![A3 layout](http://snuhci2017.github.io/AAA/report/layout.png)
* Overall Layout
 : 전체적인 layout은 크게 2가지 이론을 기반으로 하여 설계되었다.<br /> 
 먼저 Page의 Layout은 Document parsing 이론(Top to bottom, Left to right)에 맞게 설계를 하였으며 Visualization은 Ben shneiderman의 Information Seeking Mantra(Overview first, Zoom and Filter, Details on Demand)에 기반하여 구현하였다.

* Ranking Pane<br />
 Ranking pane은 information seeking mantra에서 overview를 담당하는 요소이다.<br />
 Lineup 시각화를 모티프로 하여 구현하였으며 Weight RadarChart를 이용하여 사용자가 criteria별로 가중치를 주면 계산된 Score를 기준으로 의원들을 Sorting하여 보여준다. 각각의 criteria별로 올바른 color mapping을 사용하여 각각의 bar가 어떤 criterion을 나타내는지 쉽게 볼 수 있게 시각화하였다. 
* Detail Pane<br />
 Detail pane은 information seeking mantra에서 details on demand를 담당하는 부분으로 각각의 요소들은 올바른 relationship과 grouping에 근거하여 시각화 요소들을 배치하였다. 사용자들은 Ranking pane에서 비교하고 싶은 의원들을 선택하여 Details pane에서 세부 정보들을 비교할 수 있다.
* GeoMap<br />
 GeoMap은 Ranking pane와 함께 information seeking mantra에서 overview를 담당하는 요소이다. <br />국회의원정보의 경우 지역구와 같은 geo data도 의사결정의 근거가 될 수 있는 중요한 데이터이므로 Ranking Pane의 row를 GeoMap의 지역구정보에 linking시켜 해당 의원의 지역구가 어디인지 한눈에 볼 수 있게 하였다. 또한 Ranking Pane의 stacked bar chart로 표시되는 total score는 GeoMap의 지역구 color의 luminance에 맵핑시켜 사용자가 한눈에 국회의원 의정수행 능력을 파악할 수 있도록 구현하였다.
* Weight RadarChart<br />
 Weight RadarChart는 zoom and filter에 해당되는 요소로 사용자가 6가지의 criteria에 대해 가중치를 줄 수 있도록 구현하였다. Slider를 여러개 두는 것이 보다 효율적일수도 있겠지만 사용자에게 보다 aesthetic한 느낌을 주기 위해 RadarChart를 통해 interaction을 하도록 구현하였다. 
* Selected List<br />
 Selected List는 details on demand에 해당되는 요소로 사용자의 선택 정보를 color에 mapping시켜 사용자에게 시각적 피드백을 준다. 의원들간 시각적으로 잘 구분이 되도록 적절한 color mapping을 사용하여 시각화 하였다.
* Bill Sum (Stacked bar + accumulated line chart)<br />
 Bill Sum은 details on demand에 해당되는 요소로 의원별 기간당 의안 발의수를 stacked bar chart로, 누적 의안 발의수를 line chart로 시각화하여 pareto chart와 비슷한 형식으로 의원간 의정수행능력 비교를 용이하게 하였다.  
* Detail Bars<br />
 Detail Bars는 details on demand에 해당되는 요소이다. Weight RadarChart의 criterion들을 기준으로 의원간 비교가 용이하도록 bar chart로 시각화를 하였다. Bar chart의 color는 Selected List와 통일성을 유지하기 위해 같은 color를 사용하였다.
* Guage<br />
 Gauge chart는 details on demand에 해당되는 요소이다. Gauge chart는 해당 의원의 정치적 성향이 진보로 어느정도 치우쳤는지, 보수로 어느정도 치우쳤는지를 시각화한다. 

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
