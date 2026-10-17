import { Property } from '../types';

type Locale = 'fr' | 'sw' | 'ar';
type PropertyContentTranslation = { title: string; description: string };

const propertyContentTranslations: Record<string, Partial<Record<Locale, PropertyContentTranslation>>> = {
  'prop-1': {
    fr: {
      title: 'Maison familiale moderne de 4 chambres avec logement pour le personnel',
      description: 'Cette maison familiale contemporaine de quatre chambres, soigneusement conçue, se trouve dans un quartier résidentiel prisé de Seeta, à Mukono. Elle comprend un vaste séjour ouvert avec des finitions de plafond en plaques de plâtre, une cuisine équipée d’un plan de travail en granit importé et d’un garde-manger, ainsi qu’une suite parentale avec dressing et balcon privé. Un logement indépendant pour le personnel est également prévu. La maison dispose d’un raccordement NWSC prêt à l’emploi, d’une réserve d’eau de toiture de 5 000 litres, d’un compteur prépayé Umeme Yaka et d’une allée pavée en cabro, dans une enceinte sécurisée par un mur périmétrique et une clôture électrique.'
    },
    sw: {
      title: 'Nyumba ya Kisasa ya Familia yenye Vyumba 4 na Makazi ya Wafanyakazi',
      description: 'Nyumba hii ya kisasa ya familia yenye vyumba vinne vya kulala imejengwa kwa umakini katika eneo zuri la makazi la Seeta, Mukono. Ina sebule pana iliyo wazi yenye mapambo ya dari ya gypsum, jiko la kisasa lenye kaunta ya granite iliyoagizwa kutoka nje na stoo, pamoja na chumba kikuu cha kulala chenye kabati la kuingia ndani na roshani ya faragha. Pia kuna makazi ya wafanyakazi yaliyojitegemea. Nyumba ina muunganisho tayari wa maji wa NWSC, tenki la akiba la lita 5,000 juu ya paa, mita ya umeme ya kulipia kabla ya Umeme Yaka, na njia ya kuingia iliyopambwa kwa cabro ndani ya ukuta wa uzio wenye uzio wa umeme.'
    },
    ar: {
      title: 'منزل عائلي حديث من 4 غرف نوم مع سكن للموظفين',
      description: 'يقع هذا المنزل العائلي المعاصر المكوّن من أربع غرف نوم، والمصمم بعناية، في حي سكني راقٍ في سيتا، موكونو. يضم صالة معيشة واسعة مفتوحة بتشطيبات سقف من ألواح الجبس، ومطبخاً حديثاً مزوداً بسطح من الغرانيت المستورد ومخزن مؤن، وجناحاً رئيسياً بخزانة ملابس يمكن الدخول إليها وشرفة خاصة. كما يضم سكناً مستقلاً للموظفين. المنزل مجهز بتوصيلة مياه NWSC جاهزة، وخزان احتياطي على السطح بسعة 5,000 لتر، وعداد Umeme Yaka مسبق الدفع، وممر مرصوف بحجر كابرو داخل سور محيطي آمن مزود بسياج كهربائي.'
    }
  },
  'prop-2': {
    fr: {
      title: 'Appartement exécutif spacieux de 3 chambres avec balcon panoramique',
      description: 'Appartement lumineux de trois chambres à louer à l’étage supérieur, à moins de trois minutes du centre de Mukono. Il comprend un sol entièrement carrelé, une cuisine moderne équipée de placards en acajou massif et un vaste séjour donnant sur un balcon avec vue sur les collines verdoyantes de Mukono. La résidence offre un gardien de sécurité 24 h/24 et 7 j/7, une vidéosurveillance, un balcon dédié à la lessive et une alimentation en eau à pression constante.'
    },
    sw: {
      title: 'Fleti Kubwa ya Kisasa yenye Vyumba 3 na Roshani Yenye Mandhari Nzuri',
      description: 'Fleti angavu ya kupangisha yenye vyumba vitatu vya kulala kwenye ghorofa ya juu, umbali wa chini ya dakika tatu kutoka katikati ya mji wa Mukono. Ina sakafu ya vigae, jiko la kisasa lenye kabati za mahogany imara na sebule pana inayofunguka kuelekea roshani yenye mandhari ya vilima vya kijani vya Mukono. Makazi yana mlinzi saa 24 kila siku, kamera za CCTV, roshani maalumu ya kufulia na mfumo wa maji wenye shinikizo la kudumu.'
    },
    ar: {
      title: 'شقة تنفيذية واسعة من 3 غرف نوم مع شرفة ذات إطلالة خلابة',
      description: 'شقة مشرقة للإيجار من ثلاث غرف نوم في الطابق العلوي، على بُعد أقل من ثلاث دقائق من وسط موكونو. تتميز بأرضيات مبلطة بالكامل ومطبخ حديث بخزائن من خشب الماهوغاني الصلب وصالة واسعة تفتح على شرفة تطل على تلال موكونو الخضراء. يضم المجمع حارس أمن على مدار الساعة، وكاميرات مراقبة، وشرفة مخصصة لغسيل الملابس، ونظام مياه بضغط ثابت.'
    }
  },
  'prop-3': {
    fr: {
      title: 'Villa de luxe de 5 chambres sur les collines, terrain de 25 décimales',
      description: 'Cette villa remarquable domine la crête de Sonde et offre une vue panoramique sur le lac Victoria. Elle comprend de hauts plafonds, des lustres design, une cuisine de chef avec îlot central, un bureau à domicile, une suite parentale avec jacuzzi et terrasse ensoleillée à garde-corps vitré, ainsi qu’une piscine avec gazebo ombragé. Elle dispose aussi d’un onduleur solaire de secours, d’un portail coulissant motorisé, d’un forage et du raccordement NWSC, au milieu de jardins tropicaux entretenus avec avocatiers et palmiers royaux adultes.'
    },
    sw: {
      title: 'Vila ya Kifahari ya Vyumba 5 Juu ya Kilima kwenye Eneo la Desimali 25',
      description: 'Vila hii ya kuvutia iko kwenye kilele cha Sonde na ina mandhari pana ya Ziwa Victoria. Ina dari za juu, taa za mapambo, jiko la mpishi lenye kisiwa cha kati, chumba cha ofisi ya nyumbani, chumba kikuu chenye beseni la jacuzzi na mtaro wa jua wenye kingo za kioo, pamoja na bwawa la kuogelea na gazebo yenye kivuli. Pia ina mfumo wa nishati ya jua wa akiba, lango la kuteleza linaloendeshwa kwa mota, kisima kirefu pamoja na maji ya NWSC, na bustani za kitropiki zilizotunzwa zenye miti ya parachichi na minazi ya kifalme iliyokomaa.'
    },
    ar: {
      title: 'فيلا فاخرة من 5 غرف نوم على التل بمساحة 25 ديسيمال',
      description: 'تقع هذه الفيلا المعمارية المميزة على مرتفع سوندي وتوفر إطلالات بانورامية باتجاه بحيرة فيكتوريا. تضم أسقفاً عالية وثريات مصممة ومطبخاً للطهاة بجزيرة مركزية ومكتباً منزلياً وجناحاً رئيسياً مع جاكوزي وشرفة مشمسة بدرابزين زجاجي، إضافة إلى مسبح وشرفة مظللة. كما تتوفر وحدة طاقة شمسية احتياطية وبوابة منزلقة آلية وبئر مع مياه NWSC وحدائق استوائية معتنى بها تضم أشجار أفوكادو ونخيلاً ملكياً ناضجاً.'
    }
  },
  'prop-4': {
    fr: {
      title: 'Charmant bungalow de 2 chambres avec jardin privé clôturé',
      description: 'Ce bungalow indépendant de deux chambres convient aux jeunes couples ou aux professionnels en quête de calme et d’intimité. Il dispose d’une cour privée entièrement indépendante avec pelouse et parterres fleuris, d’un mur d’enceinte en blocs de béton, de portes et fenêtres en acier renforcé, de placards de cuisine intégrés et de compteurs séparés pour l’eau et l’électricité. Les taxis publics de l’autoroute de Jinja sont facilement accessibles.'
    },
    sw: {
      title: 'Bangaloo ya Kuvutia yenye Vyumba 2 na Bustani ya Faragha Iliyozungushiwa Uzio',
      description: 'Bangaloo hii ya kujitegemea yenye vyumba viwili vya kulala inafaa kwa wanandoa wachanga au wataalamu wanaotaka faragha na utulivu. Ina kiwanja cha faragha chenye nyasi na vitanda vya maua, ukuta wa uzio wa matofali ya saruji, milango na madirisha ya chuma yaliyoimarishwa, kabati za jikoni zilizowekwa na mita tofauti za maji na umeme. Pia iko karibu na vituo vya teksi za umma kando ya barabara kuu ya Jinja.'
    },
    ar: {
      title: 'منزل مستقل مريح من غرفتي نوم مع حديقة خاصة مسوّرة',
      description: 'يناسب هذا المنزل المستقل المكوّن من غرفتي نوم الأزواج الشباب أو المهنيين الباحثين عن الخصوصية والهدوء. يضم ساحة خاصة مستقلة بالكامل مع عشب أخضر وأحواض زهور، وسوراً من كتل خرسانية، وأبواباً ونوافذ فولاذية معززة، وخزائن مطبخ مركبة، وعدادات منفصلة للمياه والكهرباء. كما يسهل الوصول منه إلى سيارات الأجرة العامة على طريق جينجا السريع.'
    }
  },
  'prop-5': {
    fr: {
      title: 'Maison de ville neuve de 3 chambres dans une résidence sécurisée',
      description: 'Cette maison de ville moderne à deux niveaux se trouve dans un domaine planifié et organisé de seulement 12 logements. Elle offre un séjour à grand volume, des portes coulissantes en aluminium, des carreaux de porcelaine importés et une chambre principale avec balcon à la Juliette. Le domaine dispose d’une barrière surveillée 24 h/24, d’une aire de jeux pour enfants et de lampadaires solaires. La fibre est raccordée à chaque logement et le titre foncier est prêt pour un transfert hypothécaire.'
    },
    sw: {
      title: 'Nyumba Mpya ya Ghorofa Mbili yenye Vyumba 3 katika Makazi Yenye Ulinzi',
      description: 'Nyumba hii ya kisasa ya ghorofa mbili iko katika makazi yaliyopangwa vizuri yenye nyumba 12 pekee. Ina sebule yenye dari ya juu, milango ya kisasa ya kuteleza ya alumini, sakafu ya vigae vya porcelain vilivyoagizwa kutoka nje na chumba kikuu chenye roshani ya Juliet. Makazi yana lango linalolindwa saa 24, uwanja wa watoto na taa za barabarani zinazotumia nishati ya jua. Intaneti ya fiber imeunganishwa kwenye kila nyumba na hati safi ya umiliki iko tayari kwa uhamisho wa mkopo wa nyumba.'
    },
    ar: {
      title: 'منزل متلاصق جديد من 3 غرف نوم في مجمع سكني مسوّر',
      description: 'يقع هذا المنزل العصري المكوّن من طابقين في مجمع سكني مخطط ومنظم يضم 12 وحدة فقط. يتميز بصالة ذات سقف مرتفع وأبواب ألمنيوم منزلقة حديثة وأرضيات بورسلان مستورد وغرفة رئيسية بشرفة جولييت. يضم المجمع بوابة مراقبة على مدار الساعة وملعباً للأطفال وإنارة شوارع تعمل بالطاقة الشمسية. كما تم توصيل الألياف الضوئية بكل وحدة، وسند الملكية السليم جاهز لنقل الرهن العقاري.'
    }
  },
  'prop-6': {
    fr: {
      title: 'Terrain résidentiel de premier choix de 50 décimales (un demi-acre) avec titre',
      description: 'Cette parcelle rectangulaire en pente douce se situe dans un quartier résidentiel établi de Kyetume, à Mukono. Elle convient à la construction d’une maison de campagne, d’appartements locatifs ou à une subdivision en parcelles plus petites de 50 × 100 pieds. Elle donne directement sur une route en terre rouge de 40 pieds de large, avec poteaux électriques et conduite d’eau NWSC sur place. Le titre foncier Private Mailo a été vérifié et ne comporte ni charge ni occupant; le transfert peut être immédiat.'
    },
    sw: {
      title: 'Ardhi Bora ya Makazi ya Desimali 50 (Nusu Ekari) Yenye Hati',
      description: 'Kiwanja hiki cha mstatili chenye mteremko mdogo kiko katika eneo la makazi lililoendelezwa la Kyetume, Mukono. Kinafaa kujenga nyumba ya mashambani, fleti za kupangisha au kugawanywa kuwa viwanja vidogo vya futi 50 kwa 100. Kina ufikiaji wa moja kwa moja wa barabara ya udongo wa murram yenye upana wa futi 40, nguzo za umeme na bomba kuu la maji la NWSC. Hati ya ardhi ya Private Mailo imethibitishwa haina madai wala wavamizi na iko tayari kuhamishwa mara moja.'
    },
    ar: {
      title: 'أرض سكنية مميزة بمساحة 50 ديسيمال (نصف فدان) مع سند ملكية',
      description: 'تقع هذه القطعة المستطيلة ذات الانحدار الخفيف في حي سكني قائم في كيتومه، موكونو. وهي مناسبة لبناء منزل ريفي أو شقق للإيجار أو تقسيمها إلى قطع أصغر بمقاس 50 × 100 قدماً. لها مدخل مباشر إلى طريق ترابي بعرض 40 قدماً، مع أعمدة كهرباء وخط مياه NWSC في الموقع. تم التحقق من سند Private Mailo وخلوه من الأعباء أو الشاغلين، وهي جاهزة للنقل فوراً.'
    }
  },
  'prop-7': {
    fr: {
      title: 'Bungalow colonial classique de 4 chambres avec vaste verger d’avocatiers',
      description: 'Cette solide maison en briques est nichée au milieu des jardins verdoyants et des terres fertiles de la division de Goma. Elle comprend une grande véranda idéale pour le thé du soir, une salle à manger spacieuse, une cuisine avec réserve extérieure pour le bois et abri de cuisson, un logement séparé de deux pièces pour le personnel et un garage double fermé. Un forage profond d’eau douce et un verger adulte d’avocatiers Haas, de manguiers et de bananiers doux complètent la propriété.'
    },
    sw: {
      title: 'Bangaloo ya Kikoloni yenye Vyumba 4 na Bustani Kubwa ya Miti ya Parachichi',
      description: 'Nyumba hii imara ya matofali iko katikati ya bustani za kijani na udongo wenye rutuba katika tarafa ya Goma. Ina veranda kubwa inayofaa kunywa chai jioni, chumba kikubwa cha kulia, jiko lenye stoo ya kuni ya nje na sehemu ya kupikia, makazi tofauti ya wafanyakazi yenye vyumba viwili na gereji mbili inayofungwa. Kisima kirefu cha maji safi na bustani ya matunda iliyokomaa yenye parachichi za Haas, maembe na ndizi tamu vinakamilisha nyumba hii.'
    },
    ar: {
      title: 'منزل ريفي استعماري كلاسيكي من 4 غرف نوم مع بستان أفوكادو واسع',
      description: 'يقع هذا المنزل المبني من الطوب بإتقان وسط حدائق خضراء وتربة خصبة في منطقة غوما. يضم شرفة واسعة مناسبة لشاي المساء وغرفة طعام كبيرة ومطبخاً مع مخزن حطب خارجي ومأوى للطهي، إضافة إلى سكن منفصل للموظفين من غرفتين ومرآباً مزدوجاً مغلقاً. ويكتمل العقار ببئر عميقة للمياه العذبة وبستان ناضج من أفوكادو هاس والمانجو والموز الحلو.'
    }
  },
  'prop-8': {
    fr: {
      title: 'Maison moderne meublée de 3 chambres à louer',
      description: 'Cette résidence exécutive entièrement meublée est prête à être occupée immédiatement. Elle comprend des canapés italiens en cuir, un téléviseur intelligent 4K de 65 pouces et une cuisine entièrement équipée avec réfrigérateur à deux portes, four à micro-ondes, cuisinière à gaz et lave-linge. La suite parentale climatisée est dotée d’un matelas orthopédique king-size. Le loyer mensuel inclut la fibre Wi-Fi illimitée à haut débit, l’énergie solaire de secours et un gardien permanent de la cour.'
    },
    sw: {
      title: 'Nyumba ya Kisasa Yenye Samani Kamili, Vyumba 3, ya Kupangisha',
      description: 'Makazi haya ya kisasa yenye samani kamili yako tayari kukaliwa mara moja. Yana sofa za ngozi ya Italia, televisheni janja ya 4K ya inchi 65 na jiko lenye vifaa kamili, ikiwemo friji ya milango miwili, microwave, jiko la gesi na mashine ya kufulia. Chumba kikuu kina kiyoyozi na godoro la mifupa la ukubwa wa king. Kodi ya mwezi inajumuisha Wi-Fi ya fiber isiyo na kikomo na ya kasi, umeme wa akiba wa nishati ya jua na mhudumu wa kiwanja wa kudumu.'
    },
    ar: {
      title: 'منزل عصري مفروش بالكامل من 3 غرف نوم للإيجار',
      description: 'هذا المسكن التنفيذي مفروش بالكامل وجاهز للسكن فوراً. يحتوي على أطقم أرائك من الجلد الإيطالي وتلفاز ذكي 4K بقياس 65 بوصة ومطبخ مجهز بالكامل بثلاجة ذات بابين وميكروويف وموقد غاز وغسالة. تضم غرفة النوم الرئيسية المكيفة مرتبة طبية بحجم كينغ. ويشمل الإيجار الشهري إنترنت ألياف سريعاً وغير محدود وطاقة شمسية احتياطية ومشرفاً دائماً على المجمع.'
    }
  },
  'prop-9': {
    fr: {
      title: 'Villa panoramique de 4 chambres avec vue sur le lac, péninsule de Katosi',
      description: 'Cette résidence spectaculaire de style villégiature profite des brises et des couchers de soleil sur le lac Victoria. Construite selon les normes européennes, elle possède de vastes vérandas enveloppantes, des plafonds en bois dur, un chauffe-eau solaire, un forage privé avec filtration, une piscine et un pavillon pour les invités. Elle convient aussi bien à une vie paisible qu’à une location de vacances à fort rendement sur Airbnb.'
    },
    sw: {
      title: 'Vila ya Vyumba 4 Yenye Mandhari ya Ziwa kwenye Rasi ya Katosi',
      description: 'Makazi haya ya kuvutia yenye mtindo wa mapumziko yana upepo mwanana na mandhari ya machweo yasiyozuiliwa juu ya Ziwa Victoria. Yamejengwa kwa viwango vya Ulaya, yakiwa na veranda pana zinazozunguka nyumba, dari za mbao ngumu, mfumo wa kupasha maji kwa nishati ya jua, kisima cha faragha chenye kichujio cha maji, bwawa la kuogelea na nyumba ndogo ya wageni. Ni bora kwa maisha tulivu au upangishaji wa likizo wenye mapato mazuri kupitia Airbnb.'
    },
    ar: {
      title: 'فيلا من 4 غرف نوم بإطلالة على البحيرة في شبه جزيرة كاتوسي',
      description: 'يوفر هذا المسكن المذهل بطراز المنتجعات نسمات هادئة وإطلالات غروب الشمس عبر بحيرة فيكتوريا. بُني وفق المعايير الأوروبية ويضم شرفات واسعة تحيط بالمنزل وأسقفاً من الخشب الصلب وتسخيناً شمسياً للمياه وبئراً خاصة مع تنقية للمياه ومسبحاً وبيتاً للضيوف. وهو مثالي للحياة الهادئة أو للتأجير السياحي عالي العائد عبر Airbnb.'
    }
  },
  'prop-10': {
    fr: {
      title: 'Appartement abordable d’une chambre près du campus UCU',
      description: 'Cet appartement indépendant d’une chambre convient aux enseignants, au personnel universitaire ou aux jeunes professionnels travaillant dans la municipalité de Mukono. Il comprend un mur d’enceinte sécurisé avec fil barbelé, un parking pavé, un évier de cuisine intérieur avec placards hauts et une salle de bains carrelée avec douche moderne. L’alimentation en eau est fiable et dispose d’un sous-compteur individuel.'
    },
    sw: {
      title: 'Fleti Nafuu ya Chumba 1 Karibu na Kampasi ya UCU',
      description: 'Fleti hii inayojitegemea yenye chumba kimoja cha kulala inafaa kwa wahadhiri, wafanyakazi wa chuo kikuu au wataalamu wachanga wanaofanya kazi katika manispaa ya Mukono. Ina ukuta salama wa uzio wenye waya wenye miiba, maegesho yaliyopambwa kwa mawe, sinki la jikoni la ndani lenye kabati za juu na bafu la vigae lenye bomba la kisasa. Maji yanapatikana kwa uhakika na yana mita ndogo ya kupimia matumizi ya fleti.'
    },
    ar: {
      title: 'شقة اقتصادية من غرفة نوم واحدة بالقرب من حرم جامعة UCU',
      description: 'تناسب هذه الشقة المستقلة ذات غرفة النوم الواحدة المحاضرين وموظفي الجامعة والمهنيين الشباب العاملين في بلدية موكونو. تضم سوراً محيطياً آمناً مع أسلاك شائكة وموقفاً مرصوفاً وحوض مطبخ داخلياً مع خزائن علوية وحماماً مبلطاً بدش حديث. كما يتوفر إمداد موثوق بالمياه مع عداد فرعي مستقل.'
    }
  },
  'prop-11': {
    fr: {
      title: 'Bungalow neuf de 3 chambres sur un terrain de 12 décimales',
      description: 'Cette maison résidentielle récemment achevée est prête à être remise à son nouveau propriétaire. Construite en briques d’argile cuite avec une toiture en tôle, elle comprend un séjour spacieux, une salle à manger séparée, une suite parentale, des fenêtres coulissantes vitrées modernes et un mur d’enceinte enduit et peint avec un lourd portail en acier. Une cuve d’eau de 3 000 litres est installée sur le toit et la cour offre de l’espace pour un jardin ou un futur logement de personnel.'
    },
    sw: {
      title: 'Bangaloo Mpya Kabisa ya Vyumba 3 kwenye Kiwanja cha Desimali 12',
      description: 'Nyumba hii mpya ya makazi imekamilika na iko tayari kukabidhiwa. Imejengwa kwa matofali ya udongo uliochomwa na kuezekwa kwa mabati ya chuma. Ina sebule pana, chumba tofauti cha kulia, chumba kikuu chenye bafu, madirisha ya kisasa ya kioo yanayoteleza na ukuta wa uzio uliopigwa plasta na kupakwa rangi wenye lango zito la chuma. Tenki la maji la lita 3,000 limewekwa juu ya paa, na kiwanja kina nafasi ya bustani au makazi ya wafanyakazi.'
    },
    ar: {
      title: 'منزل مستقل جديد من 3 غرف نوم على أرض بمساحة 12 ديسيمال',
      description: 'اكتمل هذا المنزل السكني حديثاً وأصبح جاهزاً للتسليم. بُني من الطوب الطيني المحروق وسُقف بألواح معدنية، ويضم غرفة معيشة واسعة وغرفة طعام منفصلة وجناحاً رئيسياً ونوافذ زجاجية منزلقة حديثة وسوراً محيطياً مطلياً ببوابة فولاذية ثقيلة. توجد خزانة مياه بسعة 3,000 لتر فوق السطح، كما توفر الساحة مساحة لحديقة أو لإضافة سكن للموظفين.'
    }
  },
  'prop-12': {
    fr: {
      title: 'Immeuble commercial de premier choix avec commerces et bureaux',
      description: 'Cet immeuble commercial de trois étages, générant des revenus élevés, se trouve directement sur la très fréquentée autoroute Kampala–Jinja à Mukono. Les huit boutiques du rez-de-chaussée sont entièrement occupées par une pharmacie, un supermarché et une agence bancaire. Les deux étages supérieurs comprennent douze bureaux et une salle de conférence. Le revenu locatif brut mensuel est de 11,5 millions UGX. Le bâtiment dispose d’une alimentation commerciale triphasée, d’un générateur de secours et de plans municipaux approuvés.'
    },
    sw: {
      title: 'Jengo Bora la Biashara lenye Maduka ya Chini na Ofisi',
      description: 'Jengo hili la biashara la ghorofa tatu linalozalisha mapato makubwa liko moja kwa moja kando ya barabara kuu yenye shughuli nyingi ya Kampala–Jinja, Mukono. Maduka yote manane ya ghorofa ya chini yana wapangaji: duka la dawa, supamaketi na wakala wa benki. Ghorofa mbili za juu zina ofisi 12 na ukumbi wa mikutano. Mapato ghafi ya kodi ni UGX milioni 11.5 kwa mwezi. Jengo lina umeme wa biashara wa awamu tatu, jenereta ya akiba na michoro ya ujenzi iliyoidhinishwa na manispaa.'
    },
    ar: {
      title: 'مبنى تجاري مميز يضم متاجر في الطابق الأرضي ومكاتب',
      description: 'يقع هذا العقار التجاري المكوّن من ثلاثة طوابق والمحقق لدخل مرتفع مباشرة على طريق كمبالا–جينجا المزدحم في موكونو. تشغل صيدلية وسوبرماركت ووكالة مصرفية جميع المتاجر الثمانية في الطابق الأرضي. ويضم الطابقان العلويان 12 جناحاً مكتبياً وقاعة مؤتمرات. يبلغ إجمالي دخل الإيجار الشهري 11.5 مليون شلن أوغندي. ويتوفر كهرباء تجارية ثلاثية الطور ومولد احتياطي ومخططات بناء بلدية معتمدة.'
    }
  },
  'prop-13': {
    fr: {
      title: 'Résidence familiale de luxe clôturée avec piscine et pelouse',
      description: 'Cette magnifique résidence familiale de Seeta comprend une piscine à débordement, une pelouse paysagée, un espace barbecue extérieur et des chambres toutes équipées de salles de bains privatives. Elle dispose aussi d’une cuisine ouverte équipée d’une cuisinière et d’un four, de caméras de vidéosurveillance, d’une clôture électrique et d’un logement de deux chambres pour le personnel.'
    },
    sw: {
      title: 'Nyumba ya Kifahari ya Familia Yenye Uzio, Bwawa na Nyasi',
      description: 'Makazi haya mazuri ya familia huko Seeta yana bwawa la kuogelea la ukingo usioonekana, nyasi zilizopangwa vizuri, eneo la kuchomea nyama nje na vyumba vyote vya kulala vyenye mabafu yake. Pia yana jiko la wazi lenye jiko la kupikia na oveni, kamera za CCTV, uzio wa umeme na makazi ya wafanyakazi yenye vyumba viwili.'
    },
    ar: {
      title: 'منزل عائلي فاخر مسوّر مع مسبح وحديقة عشبية',
      description: 'يضم هذا المسكن العائلي الرائع في سيتا مسبحاً بحافة لا متناهية وحديقة عشبية منسقة ومنطقة شواء خارجية وغرف نوم جميعها بحمامات خاصة. كما يحتوي على مطبخ مفتوح مجهز بموقد وفرن وكاميرات مراقبة وسياج كهربائي وسكن للموظفين من غرفتي نوم.'
    }
  },
  'prop-14': {
    fr: {
      title: 'Paisible maison familiale de 3 chambres à la campagne de Namanoga',
      description: 'Cette charmante maison de campagne est située sur un vaste terrain de 25 décimales au sol rouge fertile. La propriété comprend une cour clôturée, un éclairage solaire et l’eau NWSC, dans un environnement rural paisible à seulement vingt minutes du centre-ville de Mukono.'
    },
    sw: {
      title: 'Nyumba Tulivu ya Familia Yenye Vyumba 3 Vijijini Namanoga',
      description: 'Nyumba hii ya kuvutia ya mashambani iko kwenye kiwanja kikubwa cha desimali 25 chenye udongo mwekundu wenye rutuba. Ina kiwanja kilichozungushiwa uzio, taa za nishati ya jua na maji ya NWSC, katika mazingira tulivu ya vijijini umbali wa dakika 20 tu kwa gari kutoka katikati ya mji wa Mukono.'
    },
    ar: {
      title: 'منزل عائلي هادئ من 3 غرف نوم في ريف نامانوغا',
      description: 'يقع هذا المنزل الريفي الساحر على قطعة واسعة بمساحة 25 ديسيمال ذات تربة حمراء خصبة. يضم فناءً مسوّراً وإنارة تعمل بالطاقة الشمسية ومياه NWSC، ويحيط به ريف هادئ على بُعد عشرين دقيقة فقط بالسيارة من وسط موكونو.'
    }
  },
  'preview-kampala': {
    fr: { title: 'Maison familiale témoin à Kampala', description: 'Annonce témoin à Kampala, en Ouganda. Cet exemple présente une annonce locale; il ne s’agit pas d’une offre réelle ni vérifiée de manière indépendante.' },
    sw: { title: 'Nyumba ya Familia ya Mfano Jijini Kampala', description: 'Tangazo la mfano jijini Kampala, Uganda. Mfano huu unaonyesha tangazo la eneo husika; si ofa halisi wala iliyothibitishwa kwa kujitegemea.' },
    ar: { title: 'منزل عائلي تجريبي في كمبالا', description: 'إعلان تجريبي في كمبالا، أوغندا. يعرض هذا المثال إعلاناً محلياً، وليس عرضاً حقيقياً أو متحققاً منه بشكل مستقل.' }
  },
  'preview-wakiso': {
    fr: { title: 'Appartement témoin à louer à Entebbe', description: 'Location témoin à Entebbe, dans le district de Wakiso. Cet exemple présente une annonce dans un autre district ougandais; il ne s’agit pas d’une offre réelle ni vérifiée de manière indépendante.' },
    sw: { title: 'Fleti ya Mfano ya Kupangisha Entebbe', description: 'Tangazo la mfano la upangishaji Entebbe, Wilaya ya Wakiso. Mfano huu unaonyesha tangazo katika wilaya nyingine ya Uganda; si ofa halisi wala iliyothibitishwa kwa kujitegemea.' },
    ar: { title: 'شقة تجريبية للإيجار في عنتيبي', description: 'إعلان إيجار تجريبي في عنتيبي، مقاطعة واكيسو. يعرض هذا المثال عقاراً في مقاطعة أوغندية أخرى، وليس عرضاً حقيقياً أو متحققاً منه بشكل مستقل.' }
  },
  'preview-jinja': {
    fr: { title: 'Terrain résidentiel témoin à Jinja', description: 'Terrain témoin à Jinja, en Ouganda. Cet exemple sert uniquement à présenter le marché; il ne s’agit pas d’une offre réelle ni vérifiée de manière indépendante.' },
    sw: { title: 'Ardhi ya Makazi ya Mfano Jinja', description: 'Tangazo la mfano la ardhi ya makazi Jinja, Uganda. Mfano huu ni kwa ajili ya kuonyesha soko pekee; si ofa halisi wala iliyothibitishwa kwa kujitegemea.' },
    ar: { title: 'أرض سكنية تجريبية في جينجا', description: 'إعلان تجريبي لأرض سكنية في جينجا، أوغندا. الغرض من المثال هو عرض السوق فقط، وليس عرضاً حقيقياً أو متحققاً منه بشكل مستقل.' }
  },
  'preview-mbarara': {
    fr: { title: 'Maison familiale témoin à Mbarara', description: 'Maison familiale témoin à Mbarara, en Ouganda. Cet exemple illustre les annonces régionales; il ne s’agit pas d’une offre réelle ni vérifiée de manière indépendante.' },
    sw: { title: 'Nyumba ya Familia ya Mfano Mbarara', description: 'Tangazo la mfano la nyumba ya familia Mbarara, Uganda. Mfano huu unaonyesha matangazo ya maeneo mbalimbali; si ofa halisi wala iliyothibitishwa kwa kujitegemea.' },
    ar: { title: 'منزل عائلي تجريبي في مبارارا', description: 'منزل عائلي تجريبي في مبارارا، أوغندا. يوضح هذا المثال الإعلانات الإقليمية، وليس عرضاً حقيقياً أو متحققاً منه بشكل مستقل.' }
  },
  'preview-gulu': {
    fr: { title: 'Appartement témoin à louer à Gulu', description: 'Location témoin à Gulu, en Ouganda. Cet exemple illustre des annonces dans le nord du pays; il ne s’agit pas d’une offre réelle ni vérifiée de manière indépendante.' },
    sw: { title: 'Fleti ya Mfano ya Kupangisha Gulu', description: 'Tangazo la mfano la upangishaji Gulu, Uganda. Mfano huu unaonyesha matangazo ya kaskazini mwa Uganda; si ofa halisi wala iliyothibitishwa kwa kujitegemea.' },
    ar: { title: 'شقة تجريبية للإيجار في غولو', description: 'إعلان إيجار تجريبي في غولو، أوغندا. يوضح هذا المثال الإعلانات في شمال أوغندا، وليس عرضاً حقيقياً أو متحققاً منه بشكل مستقل.' }
  },
  'preview-nairobi': {
    fr: { title: 'Maison témoin à Nairobi', description: 'Maison témoin à Nairobi, au Kenya. Cet exemple présente une annonce transfrontalière; il ne s’agit pas d’une offre réelle ni vérifiée de manière indépendante.' },
    sw: { title: 'Nyumba ya Mfano Nairobi', description: 'Tangazo la mfano la nyumba Nairobi, Kenya. Mfano huu unaonyesha tangazo la kuvuka mipaka; si ofa halisi wala iliyothibitishwa kwa kujitegemea.' },
    ar: { title: 'منزل تجريبي في نيروبي', description: 'منزل تجريبي في نيروبي، كينيا. يعرض هذا المثال إعلاناً عابراً للحدود، وليس عرضاً حقيقياً أو متحققاً منه بشكل مستقل.' }
  },
  'preview-dar-es-salaam': {
    fr: { title: 'Appartement témoin à louer à Dar es Salaam', description: 'Location témoin à Dar es Salaam, en Tanzanie. Cet exemple présente une annonce transfrontalière; il ne s’agit pas d’une offre réelle ni vérifiée de manière indépendante.' },
    sw: { title: 'Fleti ya Mfano ya Kupangisha Dar es Salaam', description: 'Tangazo la mfano la upangishaji Dar es Salaam, Tanzania. Mfano huu unaonyesha tangazo la kuvuka mipaka; si ofa halisi wala iliyothibitishwa kwa kujitegemea.' },
    ar: { title: 'شقة تجريبية للإيجار في دار السلام', description: 'شقة تجريبية للإيجار في دار السلام، تنزانيا. يعرض هذا المثال إعلاناً عابراً للحدود، وليس عرضاً حقيقياً أو متحققاً منه بشكل مستقل.' }
  },
  'preview-cape-town': {
    fr: { title: 'Maison témoin au Cap', description: 'Maison témoin au Cap, en Afrique du Sud. Cet exemple présente une annonce transfrontalière; il ne s’agit pas d’une offre réelle ni vérifiée de manière indépendante.' },
    sw: { title: 'Nyumba ya Mfano Cape Town', description: 'Tangazo la mfano la nyumba Cape Town, Afrika Kusini. Mfano huu unaonyesha tangazo la kuvuka mipaka; si ofa halisi wala iliyothibitishwa kwa kujitegemea.' },
    ar: { title: 'منزل تجريبي في كيب تاون', description: 'منزل تجريبي في كيب تاون، جنوب أفريقيا. يعرض هذا المثال إعلاناً عابراً للحدود، وليس عرضاً حقيقياً أو متحققاً منه بشكل مستقل.' }
  },
  'preview-london': {
    fr: { title: 'Appartement témoin à louer à Londres', description: 'Location témoin à Londres, au Royaume-Uni. Cet exemple présente une annonce transfrontalière; il ne s’agit pas d’une offre réelle ni vérifiée de manière indépendante.' },
    sw: { title: 'Fleti ya Mfano ya Kupangisha London', description: 'Tangazo la mfano la upangishaji London, Uingereza. Mfano huu unaonyesha tangazo la kuvuka mipaka; si ofa halisi wala iliyothibitishwa kwa kujitegemea.' },
    ar: { title: 'شقة تجريبية للإيجار في لندن', description: 'إعلان إيجار تجريبي في لندن، المملكة المتحدة. يعرض هذا المثال إعلاناً عابراً للحدود، وليس عرضاً حقيقياً أو متحققاً منه بشكل مستقل.' }
  },
  'preview-new-york': {
    fr: { title: 'Maison témoin à New York', description: 'Maison témoin à New York, aux États-Unis. Cet exemple présente une annonce transfrontalière; il ne s’agit pas d’une offre réelle ni vérifiée de manière indépendante.' },
    sw: { title: 'Nyumba ya Mfano New York', description: 'Tangazo la mfano la nyumba New York, Marekani. Mfano huu unaonyesha tangazo la kuvuka mipaka; si ofa halisi wala iliyothibitishwa kwa kujitegemea.' },
    ar: { title: 'منزل تجريبي في نيويورك', description: 'منزل تجريبي في مدينة نيويورك، الولايات المتحدة. يعرض هذا المثال إعلاناً عابراً للحدود، وليس عرضاً حقيقياً أو متحققاً منه بشكل مستقل.' }
  }
};

const featureTranslations: Record<string, Record<Locale, string>> = {
  'Air conditioning': { fr: 'Climatisation', sw: 'Kiyoyozi', ar: 'تكييف الهواء' },
  Balcony: { fr: 'Balcon', sw: 'Roshani', ar: 'شرفة' },
  Borehole: { fr: 'Forage', sw: 'Kisima kirefu', ar: 'بئر ارتوازية' },
  Electricity: { fr: 'Électricité', sw: 'Umeme', ar: 'كهرباء' },
  Fence: { fr: 'Clôture', sw: 'Uzio', ar: 'سياج' },
  Furnished: { fr: 'Meublé', sw: 'Ina samani', ar: 'مفروش' },
  Garden: { fr: 'Jardin', sw: 'Bustani', ar: 'حديقة' },
  'Gated community': { fr: 'Résidence sécurisée', sw: 'Makazi yenye lango la ulinzi', ar: 'مجمع سكني مسوّر' },
  'Internet availability': { fr: 'Accès à Internet', sw: 'Huduma ya intaneti', ar: 'توفر الإنترنت' },
  Parking: { fr: 'Parking', sw: 'Maegesho', ar: 'موقف سيارات' },
  Security: { fr: 'Sécurité', sw: 'Ulinzi', ar: 'أمن' },
  'Servant quarters': { fr: 'Logement du personnel', sw: 'Makazi ya wafanyakazi', ar: 'سكن الموظفين' },
  'Swimming pool': { fr: 'Piscine', sw: 'Bwawa la kuogelea', ar: 'مسبح' },
  'Water availability': { fr: 'Approvisionnement en eau', sw: 'Upatikanaji wa maji', ar: 'توفر المياه' }
};

const plotSizeTranslations: Record<string, Record<Locale, string>> = {
  '50 x 100 ft (12 Decimals)': { fr: '50 × 100 pi (12 décimales)', sw: 'futi 50 × 100 (desimali 12)', ar: '50 × 100 قدم (12 ديسيمال)' },
  'Shared Gated Compound': { fr: 'Résidence sécurisée partagée', sw: 'Kiwanja cha pamoja chenye lango la ulinzi', ar: 'مجمع مشترك مسوّر' },
  '25 Decimals (Quarter Acre+)': { fr: '25 décimales (plus d’un quart d’acre)', sw: 'Desimali 25 (zaidi ya robo ekari)', ar: '25 ديسيمال (أكثر من ربع فدان)' },
  '10 Decimals Private Compound': { fr: 'Cour privée de 10 décimales', sw: 'Kiwanja cha faragha cha desimali 10', ar: 'مجمع خاص بمساحة 10 ديسيمال' },
  'Estate Plot with Private Patio': { fr: 'Parcelle du domaine avec patio privé', sw: 'Kiwanja cha makazi chenye baraza la faragha', ar: 'قطعة في مجمع سكني مع فناء خاص' },
  '50 Decimals (0.50 Acre)': { fr: '50 décimales (0,50 acre)', sw: 'Desimali 50 (ekari 0.50)', ar: '50 ديسيمال (0.50 فدان)' },
  '35 Decimals': { fr: '35 décimales', sw: 'Desimali 35', ar: '35 ديسيمال' },
  '15 Decimals': { fr: '15 décimales', sw: 'Desimali 15', ar: '15 ديسيمال' },
  '50 Decimals (Half Acre) with Lake Views': { fr: '50 décimales (un demi-acre) avec vue sur le lac', sw: 'Desimali 50 (nusu ekari) zenye mandhari ya ziwa', ar: '50 ديسيمال (نصف فدان) بإطلالة على البحيرة' },
  'Apartment Block Compound': { fr: 'Cour de l’immeuble d’appartements', sw: 'Kiwanja cha jengo la fleti', ar: 'مجمع مبنى الشقق' },
  '20 Decimals Commercial Frontage': { fr: 'Façade commerciale de 20 décimales', sw: 'Eneo la biashara la desimali 20', ar: 'واجهة تجارية بمساحة 20 ديسيمال' },
  '20 Decimals': { fr: '20 décimales', sw: 'Desimali 20', ar: '20 ديسيمال' },
  '25 Decimals': { fr: '25 décimales', sw: 'Desimali 25', ar: '25 ديسيمال' }
};

export function getLocalizedProperty(property: Property, language: string) {
  const translation = propertyContentTranslations[property.id]?.[language as Locale];
  return {
    title: translation?.title ?? property.title,
    description: translation?.description ?? property.description,
    plotSize: property.plotSize
      ? plotSizeTranslations[property.plotSize]?.[language as Locale] ?? property.plotSize
      : undefined,
    features: property.features.map((feature) =>
      featureTranslations[feature]?.[language as Locale] ?? feature
    ),
    isTranslated: language === 'en' || Boolean(translation),
    sourceLanguage: property.contentLanguage ?? 'en'
  };
}

export function getOriginalLanguageNotice(language: string, sourceLanguage: string): string {
  const originalLanguage = sourceLanguage.toUpperCase();
  const notices: Record<string, string> = {
    fr: `Texte original (${originalLanguage})`,
    sw: `Maandishi ya asili (${originalLanguage})`,
    ar: `النص الأصلي (${originalLanguage})`
  };
  return notices[language] ?? `Original text (${originalLanguage})`;
}
