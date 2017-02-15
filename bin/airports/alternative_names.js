/////////////////////////////////////////////////////////////////
// module globals
/////////////////////////////////////////////////////////////////
const _ALTERNATIVE_NAMES = {
  'ADB' : 'Ephesus,Temple of Artemis,Library of Celsus',
  'AGR' : 'Taj Mahal,Tomb of Itimad ud Daulah,Jama Mosque,Agra Fort,Musamman Burj',
  'AMS' : 'Rijksmuseum ,Anne Frank House,Van Gogh Museum,Heinekem Experience',
  'ASR' : 'Cappadocia ',
  'ATQ' : 'Harmandir Sahib (Golden Temple)',
  'BCN' : 'Sagrada Familia ,Casa Batllo ,Casa Mila,Palau de la Musica Ordeo Catala,Camp Nou,La Pedrera ,La Boqueria,Park Guell,La Rambla',
  'BJS' : 'Great Wall of China,Forbidden City,Tianamen Square,Temple of Heaven,Summer Palace,Yonghe Temple,Meridian Gate',
  'BKK' : 'Wat Pho / Temple of the Reclining Buddha,Wat Phra Kaew / Temple of the Emerald Buddha,Grand Palace,Wat Traimit / Temple of the Golden Buddha,Wat Arun / Temple of Dawn',
  'BOM' : 'Gateway of India,Elephanta Caves ,Elephanta Island,Haj Ali Dargah,Chhatrapati Shivaji Terminus ',
  'BUD' : 'St. Stephens Basilica,Buda Castle,Hungarian State Opera House (Magyar Allami Operahaz),Szechenyi Thermal Bath,Hösök tere,Fishermans Bastion',
  'CAI' : 'Great Pyramids,The Sphinx ',
  'CUZ' : 'Machu Picchu ,Sacsayhuaman / Sakasaywaman,Inca Trail,Plaza de Armas,Sacred Valley,Cusco Cathedral',
  'DEL' : 'The Red Fort,Indiai Gate,Humayuns Tomb,Akshardham',
  'DNZ' : 'Pamukkale ',
  'DXB' : 'Dubai Fountains,Burj Khalifa,Burj Al Arab',
  'EZE' : 'Teatro Colon,Puerto Madero,La Recoleta Cemetery ,La Boca,Plaza de Mayo',
  'AEP' : 'Teatro Colon,Puerto Madero,La Recoleta Cemetery ,La Boca,Plaza de Mayo',
  'FCO' : 'Colosseum,Pantheon,Basilica di Santa Maria Maggiore,Roman Forum,Trevi Fountain,Piazza Navona,Spanish Steps,St. Peters Bascilica,Sistine Chapel,Amalfi Coast',
  'CIA' : 'Colosseum,Pantheon,Basilica di Santa Maria Maggiore,Roman Forum,Trevi Fountain,Piazza Navona,Spanish Steps,St. Peters Bascilica,Sistine Chapel,Amalfi Coast',
  'FLR' : 'Florence Cathedral,Statue of David,Galleria dell Accademia,Piazzale Michelangelo ,Ponte alle Grazie',
  'GIG' : 'Christ the Redeemer,Statue of Christ,Copacabana,Sugarload Mountain',
  'HKG' : 'Victoria Peak,Tian Tan Buddha (Big Buddha),Nan Lian Garden,Chi Lin Nunnery ,Disneyland (Hong Kong),Po Lin Monastery ,Ten Thousand Buddhas Monastery ',
  'TYO' : 'Shinjuku Gyoen National Garden,Meiji Jingu Shrine,Tokyo Tower,Senso-ji Temple',
  'ICN' : 'Gyeongbokgung,Myeong-dong,Changdeokgung',
  'IGR' : 'Iguazu Falls',
  'IST' : 'Blue Mosque,Hagia Sophia,Topkapi Palace,Sultan Ahmed Mosque,Grand Bazaar,Basilica Cistern',
  'JAI' : 'City Palace,Hawa Mahal,Amer Fort,Jal Mahal,Jaigarh Fort',
  'JDH' : 'Umaid Bhawan Palace,Sardar Market,Mehrangarh Fort,Jaswant Thada',
  'JOH' : 'Umaid Bhawan Palace,Sardar Market,Mehrangarh Fort,Jaswant Thada',
  'JSA' : 'Bada Bagh ,Patwon Ki Haveliyan,Jaisalmer Fort',
  'KTM' : 'Swayambhunath Temple,Boudhanath,Kopan Monastery,Thamel,Pashupatinath Temple,Durbar Square',
  'KUL' : 'Petronas Towers,Kuala Lumpur Tower,Batu Caves',
  'LAS' : 'Grand Canyon',
  'LAX' : 'Hollywood ,Disneyland ',
  'LED' : 'Grand Palace,Church of the Savior on Spiled Blood,Winter Palace,Saint Isaacs Cathedral,Hermitage Museum',
  'LIS' : 'Jeronimos Monastery,Belem Tower,Sao Jorge Castle,Alfama,Bairro Alto,Prace do Comercio (Terreiro do Paco)',
  'LON' : 'Big Ben,British Museum,Tower of London,London Eye,St Pauls Cathedral,Buckingham Palace,Tower Bridge,Westminister Abbey,Piccadilly Circus,Stonehenge',
  'LXR' : 'Karnak Temple,Valley of the Kings,Colossi of Memnon,Vallye of the Queens,Luxor Temple',
  'MCO' : 'Disney World,Magic Kingdom,Univeral Orlando',
  'MOW' : 'Kremlin,Saint Basils Cathedral,Red Square',
  'MUC' : 'Englischer Garten,Nymphenburg Palace,Hofbräuhaus,Neuschwanstein Castle',
  'NAP' : 'Capri',
  'NYC' : 'Central Park,Empire State Building,Metropolitan Museum,Rockefeller Center,Brooklyn Bridge,Statue of Liberty,World Trade Center',
  'PAR' : 'Musee dOrsay,Eiffel Tower,Sacré-Cœur,The Louvre,Arc de Triomphe,Champs-Elysees,Notre Dame Cathedral',
  'PRG' : 'Old Town (Stare Mesto),Charles Bridge,Old Town Square ',
  'PSA' : 'Leaning Tower of Pisa',
  'PVG' : 'The Bund,Yu Garden,Peoples Square,Oriental Pearl Tower',
  'SHA' : 'The Bund,Yu Garden,Peoples Square,Oriental Pearl Tower',
  'RAK' : 'Medina of Marrakesh,Jardin Majorelle,Jemaa el-Fnaa,Majorelle Garden,Bahia Palace',
  'REP' : 'Angkor Wat,Bayon Temple,Ta Prohm',
  'SFO' : 'Golden Gate Bridge,Alcatraz ,Fishermans Wharf,Chinatown,Pier 39',
  'SLC' : 'Old Faithful ,Mammoth Hot Springs,Grand Prismatic Spring',
  'BZN' : 'Old Faithful ,Mammoth Hot Springs,Grand Prismatic Spring',
  'SYD' : 'Sydney Harbour,Bondi Beach,Sydney Opera House',
  'TXL' : 'Reichstag,Brandenburg Gate,Berlin Wall,Pergamon Museum ,Checkpoint Charlie,Memorial to the Murdered Jews of Europe,Berlin Cathedral',
  'SXF' : 'Reichstag,Brandenburg Gate,Berlin Wall,Pergamon Museum ,Checkpoint Charlie,Memorial to the Murdered Jews of Europe,Berlin Cathedral',
  'UDR' : 'Dilwara Temples,Saheliyon ki Bari,Lake Pichola,Fateh Sagar Lake,Monsoon Palace,Ghantaghar,Jagdish Temple',
  'VCE' : 'Grand Canal,Saint Marks Basilica,Piazza San Marco ,Rialto Bridge,Doges Palace,Murano',
  'WAS' : 'White House,Smithsonian,United States Capitol,National Mall,Lincoln Memorial',
  'XIY' : 'Terracotta Army,Giant Wild Goose Pagoda,Mausoleum of the First Qin Emperor',
  'PPT' : 'Tahiti'
};
/////////////////////////////////////////////////////////////////
// module prototype
/////////////////////////////////////////////////////////////////
function AlternativeNames() {
};
AlternativeNames.prototype.run = function( argv, asyncsCounter, airports ) {
  for( var iata_3code in airports ) {
    if( _ALTERNATIVE_NAMES.hasOwnProperty(iata_3code.toUpperCase()) ) {
      airports[iata_3code].alternative_name = _ALTERNATIVE_NAMES[iata_3code.toUpperCase()];
    }
  }
};
module.exports = AlternativeNames;
