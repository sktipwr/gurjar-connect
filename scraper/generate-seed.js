// Generates realistic seed data based on actual Gurjar community profession distribution
const fs = require('fs');
const path = require('path');

const NAMES = [
  'Rahul Gurjar','Priya Sharma','Amit Kumar','Sunita Devi','Vikram Singh',
  'Neha Gurjar','Rajesh Choudhary','Pooja Yadav','Suresh Gurjar','Anita Singh',
  'Mahesh Sharma','Kavita Gurjar','Dinesh Kumar','Ritu Choudhary','Sandeep Gurjar',
  'Anjali Sharma','Pankaj Singh','Meena Devi','Yogesh Gurjar','Rekha Yadav',
  'Deepak Kumar','Sunita Gurjar','Ramesh Sharma','Lata Devi','Vikas Singh',
  'Seema Choudhary','Naresh Gurjar','Usha Sharma','Rohit Kumar','Mamta Singh',
  'Aakash Gurjar','Divya Sharma','Kiran Singh','Sachin Yadav','Nisha Gurjar',
  'Hemant Kumar','Sarita Devi','Tarun Gurjar','Alka Sharma','Gaurav Singh',
  'Radha Gurjar','Mohan Choudhary','Sushma Devi','Lalit Kumar','Shanti Gurjar',
  'Nitin Sharma','Geeta Yadav','Ashok Gurjar','Vandana Singh','Ravi Kumar',
  'Preeti Gurjar','Sunil Sharma','Nirmala Devi','Arun Singh','Bharti Gurjar',
  'Devendra Kumar','Sudha Sharma','Pramod Gurjar','Manju Devi','Ravindra Singh',
  'Pushpa Choudhary','Narendra Gurjar','Kamla Devi','Sanjay Kumar','Shobha Sharma',
];

const HEADLINES = [
  'Senior Software Engineer at TCS',
  'Product Manager at Infosys',
  'Full Stack Developer at Wipro',
  'Data Scientist at HCL Technologies',
  'DevOps Engineer at Tech Mahindra',
  'Business Analyst at Accenture',
  'Chartered Accountant | Tax Consultant',
  'Senior CA at Deloitte India',
  'Finance Manager at KPMG',
  'Accounts Manager at Ernst & Young',
  'IAS Officer | Government of Rajasthan',
  'IPS Officer | Rajasthan Police',
  'Deputy Collector | Government Service',
  'Assistant Commissioner | Income Tax Dept',
  'Doctor | MBBS, MD | Govt Hospital',
  'Surgeon at AIIMS Delhi',
  'Pediatrician | Private Practice',
  'General Physician | Healthcare',
  'Advocate | High Court of Rajasthan',
  'Senior Lawyer | Supreme Court',
  'Legal Consultant | Corporate Law',
  'Entrepreneur | Founder at AgriTech Startup',
  'Co-Founder & CEO | EdTech Company',
  'Director | Real Estate & Construction',
  'Business Owner | Export & Import',
  'MBA Graduate | Marketing Manager',
  'HR Manager at Reliance Industries',
  'Operations Manager at Amazon India',
  'Civil Engineer at L&T Construction',
  'Mechanical Engineer at BHEL',
  'Professor | Computer Science | IIT',
  'Assistant Professor | Delhi University',
  'School Principal | Education',
  'BTech Student | IIT Jodhpur',
  'MBA Student | IIM Ahmedabad',
  'UPSC Aspirant | Civil Services',
  'Research Scholar | JNU',
  'Marketing Director at HUL',
  'Sales Manager at Asian Paints',
  'Branch Manager | State Bank of India',
];

const CITIES = [
  'Delhi', 'Jaipur', 'Gurugram', 'Noida', 'Mumbai',
  'Bangalore', 'Pune', 'Hyderabad', 'Ahmedabad', 'Kota',
  'Alwar', 'Bharatpur', 'Agra', 'Mathura', 'Faridabad',
  'Ghaziabad', 'Lucknow', 'Chandigarh', 'Jodhpur', 'Ajmer',
];

const STATES = {
  'Delhi': 'Delhi, India',
  'Jaipur': 'Jaipur, Rajasthan, India',
  'Gurugram': 'Gurugram, Haryana, India',
  'Noida': 'Noida, Uttar Pradesh, India',
  'Mumbai': 'Mumbai, Maharashtra, India',
  'Bangalore': 'Bangalore, Karnataka, India',
  'Pune': 'Pune, Maharashtra, India',
  'Hyderabad': 'Hyderabad, Telangana, India',
  'Ahmedabad': 'Ahmedabad, Gujarat, India',
  'Kota': 'Kota, Rajasthan, India',
  'Alwar': 'Alwar, Rajasthan, India',
  'Bharatpur': 'Bharatpur, Rajasthan, India',
  'Agra': 'Agra, Uttar Pradesh, India',
  'Mathura': 'Mathura, Uttar Pradesh, India',
  'Faridabad': 'Faridabad, Haryana, India',
  'Ghaziabad': 'Ghaziabad, Uttar Pradesh, India',
  'Lucknow': 'Lucknow, Uttar Pradesh, India',
  'Chandigarh': 'Chandigarh, India',
  'Jodhpur': 'Jodhpur, Rajasthan, India',
  'Ajmer': 'Ajmer, Rajasthan, India',
};

const SKILLS_POOL = [
  ['JavaScript','React','Node.js'],
  ['Python','Machine Learning','Data Analysis'],
  ['Java','Spring Boot','Microservices'],
  ['Tax Planning','Audit','GST'],
  ['Financial Reporting','IFRS','Excel'],
  ['Public Administration','Policy','Governance'],
  ['Surgery','Patient Care','Medical Research'],
  ['Criminal Law','Civil Litigation','Legal Research'],
  ['Entrepreneurship','Fundraising','Strategy'],
  ['Product Management','Agile','Roadmapping'],
  ['Digital Marketing','SEO','Social Media'],
  ['Civil Engineering','AutoCAD','Project Management'],
  ['HR Management','Recruitment','Training'],
];

const OPEN_TO = ['jobs','mentoring','hiring','collaboration'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const members = NAMES.map((name, i) => {
  const city = pick(CITIES);
  const openToCount = Math.random() > 0.4 ? Math.floor(Math.random() * 3) + 1 : 0;
  return {
    id: `seed-${i + 1}`,
    name,
    headline: pick(HEADLINES),
    location: STATES[city],
    profileUrl: `https://www.linkedin.com/in/${slugify(name)}-${1000 + i}`,
    whatsapp: Math.random() > 0.6 ? `91${Math.floor(7000000000 + Math.random() * 2999999999)}` : undefined,
    skills: pick(SKILLS_POOL),
    openTo: pickN(OPEN_TO, openToCount),
    verified: Math.random() > 0.5,
    scrapedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
  };
});

const outPath = path.join(__dirname, '..', 'data', 'members.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(members, null, 2));
console.log(`✓ Generated ${members.length} seed members → ${outPath}`);
