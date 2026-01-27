/**
 * Architecture Question Package
 *
 * Contains trivia questions about buildings, architects, and architectural history.
 * Add your architecture questions here!
 */

module.exports = {
  id: 'architecture',
  name: 'Architecture',
  description: 'Questions about famous buildings, architects, and architectural history',
  icon: '🏛️',
  questions: [
    // Example questions - replace with your own!
    {
      question: "The Sydney Opera House, designed by Jørn Utzon, took 16 years to complete due to its revolutionary _____-shaped roof design.",
      answer: "SHELL",
      explanation: "The Sydney Opera House opened in 1973 and is now a UNESCO World Heritage Site. Utzon actually resigned from the project in 1966 due to disputes with the government, and never saw the finished building in person."
    },
    {
      question: "Architect Frank Lloyd Wright's most famous house, _____, was built over a waterfall in Pennsylvania.",
      answer: "FALLINGWATER",
      explanation: "Fallingwater was completed in 1939 and is considered one of the greatest architectural works of the 20th century. The house had significant structural problems and required extensive reinforcement over the years."
    },
    {
      question: "The _____ style of architecture, popular in 12th-15th century Europe, is characterized by pointed arches, ribbed vaults, and flying buttresses.",
      answer: "GOTHIC",
      explanation: "Gothic architecture allowed for much taller buildings and larger windows than Romanesque predecessors. The name 'Gothic' was actually meant as an insult by Renaissance critics who thought it barbaric."
    },
    {
      question: "Architect I.M. Pei's glass _____ at the Louvre in Paris was controversial when unveiled in 1989.",
      answer: "PYRAMID",
      explanation: "The Louvre Pyramid was initially despised by many Parisians who thought it clashed with the historic palace. Today it's become an iconic symbol of Paris and serves as the museum's main entrance."
    },
    {
      question: "Antoni Gaudí's unfinished masterpiece, the Sagrada _____ in Barcelona, has been under construction since 1882.",
      answer: "FAMILIA",
      explanation: "The Sagrada Familia basilica is expected to be completed around 2026, marking the centenary of Gaudí's death. It will have 18 towers when finished, representing the 12 Apostles, 4 Evangelists, the Virgin Mary, and Jesus."
    },
    {
      question: "The _____ building in Dubai held the record as the world's tallest structure at 2,717 feet until being surpassed.",
      answer: "BURJ KHALIFA",
      explanation: "The Burj Khalifa was designed by Adrian Smith of Skidmore, Owings & Merrill. The building has a Y-shaped floor plan to reduce wind forces on the tower."
    },
    {
      question: "Frank Lloyd Wright's Fallingwater was so controversial that engineers later had to secretly reinforce it using ______.",
      answer: "POST-TENSIONING",
      explanation: "Steel cables were added to counteract the building's dangerous sagging cantilevers."
    },
    {
      question: "When construction of the Florence Cathedral dome stalled for decades, Filippo Brunelleschi convinced the city he could build it without scaffolding by claiming he would use ______.",
      answer: "HERRINGBONE BRICK",
      explanation: "A self-supporting brick pattern that locked itself in place as it rose."
    },
    {
      question: "To prevent grave robbing, ancient Egyptians sometimes built tomb entrances with ______.",
      answer: "FALSE DOORS",
      explanation: "Decoy entrances meant to confuse thieves and protect the real burial chamber."
    },
    {
      question: "Medieval castles sometimes featured toilets that emptied directly into ______.",
      answer: "MOATS",
      explanation: "These garderobes dropped waste straight outside—or into the surrounding water."
    },
    {
      question: "The Leaning Tower of Pisa began tilting almost immediately after construction started because it was built on ______.",
      answer: "SOFT SOIL",
      explanation: "The tower was built on a foundation of soft soil and clay, which caused it to sink unevenly."
    },
    {
      question: "In structural engineering, the primary function of a foundation is to safely transfer building loads to the underlying _____.",
      answer: "SOIL",
      explanation: "Foundations distribute dead and live loads so stresses remain below the bearing capacity of the ground. When this goes wrong, buildings don't fall dramatically—they just sigh and crack over several expensive years."
    },
    {
      question: "In reinforced concrete design, steel rebar is used primarily to resist _____ forces.",
      answer: "TENSILE",
      explanation: "Concrete is strong in compression but weak in tension, while steel excels at handling tensile stress. Together they form a codependent relationship that has held up most of modern civilization."
    },
    {
      question: "In earthquake engineering, base isolation systems reduce seismic demand by increasing the structure's _____ period.",
      answer: "NATURAL",
      explanation: "By lengthening the natural period, base isolation shifts the building away from damaging ground motion frequencies. Instead of fighting the earthquake, the building politely sways and waits it out."
    },
    {
      question: "In steel frame construction, lateral stability against wind and seismic loads is commonly provided by _____ systems.",
      answer: "BRACING",
      explanation: "Diagonal bracing resists lateral forces efficiently by converting them into axial loads. Triangles continue to be undefeated, geometrically speaking."
    },
    {
      question: "In urban planning, zoning regulations control land use intensity through limits on height, density, and _____ ratios.",
      answer: "FLOOR-AREA",
      explanation: "Floor-area ratio (FAR) determines how much building can be placed on a given lot. It's an elegant way to say 'not everything needs to be a luxury tower.'"
    },
    {
      question: "In geotechnical engineering, consolidation theory describes the time-dependent settlement of soils under sustained _____ loading.",
      answer: "COMPRESSIVE",
      explanation: "As pore water slowly escapes from clay, effective stress increases and settlement occurs. The ground takes its time, which contractors absolutely do not."
    },
    {
      question: "In bridge engineering, suspension bridges efficiently span long distances by placing the main cables primarily in _____.",
      answer: "TENSION",
      explanation: "The cables carry loads through tension while towers handle compression. Gravity does the rest, quietly but insistently."
    },
    {
      question: "In sustainable architecture, passive solar design reduces energy demand by optimizing building orientation, insulation, and thermal _____.",
      answer: "MASS",
      explanation: "Thermal mass stores heat during the day and releases it at night, stabilizing indoor temperatures. The building remembers yesterday so HVAC systems don't have to."
    },
    {
      question: "In construction management, the critical path method identifies the sequence of tasks that determines the project's minimum _____ time.",
      answer: "COMPLETION",
      explanation: "Any delay in critical activities directly delays the entire project. This is why one missing permit can emotionally devastate an entire Gantt chart."
    },
    {
      question: "In hydraulic engineering, open-channel flow behavior is governed by gravity and boundary friction, often analyzed using the _____ equation.",
      answer: "MANNING",
      explanation: "The Manning equation estimates flow velocity based on channel slope, roughness, and hydraulic radius. Water obeys physics, not your drainage deadline."
    },
    {
      question: "In tall building design, outriggers are structural elements that connect the core to perimeter columns to reduce _____ drift.",
      answer: "LATERAL",
      explanation: "Outriggers increase the building's effective width, improving stiffness under wind loads. It's structural teamwork with excellent posture."
    },
    {
      question: "In pavement engineering, flexible pavements distribute wheel loads through layered materials that primarily fail by _____ strain.",
      answer: "TENSILE",
      explanation: "Repeated traffic loading causes fatigue cracking at the bottom of asphalt layers. Roads don't break suddenly—they just slowly give up."
    },
    {
      question: "In historical architecture, the development of the flying buttress allowed Gothic cathedrals to achieve greater wall height and _____.",
      answer: "OPENNESS",
      explanation: "By redirecting lateral forces outward, walls could be thinner and filled with stained glass. Structural innovation met divine lighting preferences."
    },
    {
      question: "In civil engineering ethics, the paramount obligation of engineers is to protect public health, safety, and _____.",
      answer: "WELFARE",
      explanation: "This principle appears in professional codes worldwide and governs all design decisions. Budgets matter—but not as much as gravity and consequences."
    },
    {
      question: "In construction contracts, a 'change order' is a formal document that modifies the original scope, cost, or _____ of work.",
      answer: "SCHEDULE",
      explanation: "Change orders are common and can significantly impact project delivery. They are the official way of saying 'we need to do this differently now, for reasons.'"
    },
    {
      question: "The ancient Egyptian Great Pyramid of Giza was originally covered in highly polished _____ that reflected the sun's light.",
      answer: "CASING STONES",
      explanation: "These stones were made of fine white limestone. While most were removed over centuries for other building projects, some are still visible at the pyramid's base, showcasing the precision of Old Kingdom masonry."
    },
    {
      question: "The Parthenon in Athens utilizes a subtle convex curving of the columns known as _____ to counteract the optical illusion of them looking concave.",
      answer: "ENTASIS",
      explanation: "Architects Ictinus and Callicrates used entasis to make the columns appear straight and strong to the human eye. Without this slight swelling, the vertical lines of the temple would appear to thin or 'waist' in the middle."
    },
    {
      question: "The Hagia Sophia in Istanbul is famous for its massive dome supported by four _____, which allow a circular dome to be placed over a square room.",
      answer: "PENDENTIVES",
      explanation: "Pendentives are triangular segments of a sphere that transition the weight of the dome down to the massive piers. This Byzantine innovation allowed for much larger interior spaces and a sense of weightlessness in the dome."
    },
    {
      question: "The Gothic style of the Notre-Dame de Paris is defined by the use of _____ buttresses, which transmit the lateral thrust of the roof away from the walls.",
      answer: "FLYING",
      explanation: "By moving the support structure outside the main building, Gothic architects could build taller walls and fill them with massive stained-glass windows, as the walls no longer had to bear the full weight of the stone vaulting."
    },
    {
      question: "The Taj Mahal, built by Emperor Shah Jahan, is a prime example of Indo-Islamic architecture characterized by its perfect _____ along a central axis.",
      answer: "SYMMETRY",
      explanation: "The entire complex, excluding the tomb of Shah Jahan himself, is perfectly symmetrical. This was intended to represent the harmony and perfection of paradise on Earth."
    },
    {
      question: "Designed by Frank Lloyd Wright, the Guggenheim Museum in New York features a continuous _____ that allows visitors to view art as they descend.",
      answer: "HELICAL RAMP",
      explanation: "This design challenged traditional gallery layouts. Instead of distinct rooms, the open-atrium spiral creates a single, flowing experience that Wright intended to feel more organic and less rigid than classical museums."
    },
    {
      question: "The Burj Khalifa in Dubai utilizes a 'buttressed _____' structural system to support its record-breaking height of 828 meters.",
      answer: "CORE",
      explanation: "This Y-shaped plan provides structural rigidity for the tower and helps manage the extreme wind forces at high altitudes. The design was inspired by the Hymenocallis desert flower."
    }
  ]
};
