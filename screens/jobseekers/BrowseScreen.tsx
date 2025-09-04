import {
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CardSwipe from "components/Swiping/CardSwipe";
import { Header } from "components/Header";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react-native";

//Filtering & Searching
import { Filtering } from "components/Filtering&Searching/Filtering";
import { SearchSheet } from "components/Filtering&Searching/SearchSheet";
import { useAuth } from "context/auth/AuthHook";

type Job = {
  jobUID: string;
  companyName?: string;
  score: number;
  feedback: {
    match_summary: string;
    skill_note: string;
    extra_note: string;
  };
  boostWeight: number;
  _id: string;
  jobPoster?: string;
  jobTitle: string;
  jobIndustry: string;
  jobDescription: string;
  jobSkills: string[];
  location: {
    city: string;
    state: string;
    postalCode: string;
  };
  employment: string[];
  workTypes: string[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
    frequency: string;
  };
  jobNormalized: string;
  profilePic: string;
  isExternal: boolean;
  status: boolean;
};

type BrowseScreenTypes = {
  userSearch: { title: string; industries: string[] };
};




export const BrowseScreen = () => {
  const { userMDB, setShortlistedJobs } = useAuth();
  const [jobPostings, setJobPostings] = useState<Job[]>([
    {
      jobUID: "job54",
      companyName: "Simons Company",
      score: 0.62,
      feedback: {
        match_summary:
          "Warehouse role with a focus on teamwork and inventory handling.",
        skill_note:
          "Requires inventory handling and teamwork skills. Consider highlighting transferable skills like attention to detail.",
        extra_note:
          "No related certifications, but this could still be a solid entry point.",
      },
      boostWeight: 0.0,
      _id: "job54",
      jobTitle: "Warehouse Personnel",
      jobIndustry: "Logistics / Delivery",
      jobDescription: `We are seeking a highly capable, proactive Executive Assistant to support our Executives of multiple fast-paced, growth-focused companies in telecom, tech, and the restaurant industry.

This role goes far beyond calendar management—you will serve as a strategic extension of the executive team, driving research, outreach, and operations with little to no handholding.

About Vivant:

Vivant is a fast-growing provider of managed connectivity solutions, specializing in delivering reliable internet, VoIP, managed networks and security to restaurants, dealerships, healthcare providers, retailers, and small to medium-sized businesses.

We help businesses eliminate outages with 100% uptime solutions that keep your business connected to your business essential tools.

We are looking for a goal-driven, highly organized individual to join our growing team.
If you are extremely organized, pay attention to smallest details, very structured in your day to day and goal-driven, welcome to Vivant, you will fit right in!

A day to day life as an Executive Assistant:

Serve as the CEO’s right hand—manage calendar, emails, priorities, and follow-ups without constant oversight
Conduct deep lead generation using Apollo, RocketReach, Hunter.io, LinkedIn, and other tools with only basic input (e.g., company name, role, or employee name)
Scrub and validate lead lists using ZeroBounce or similar tools, then run outbound campaigns via Lemlist
Execute and manage email marketing campaigns from list building to copywriting, sequencing, and performance tracking
Prepare briefs, research decks, and partnership dossiers by sourcing data from multiple platforms efficiently
Coordinate with vendors, legal, and internal teams on contract prep, signature follow-ups, and operational tasks
Manage podcast and event logistics, including guest sourcing, outreach, scheduling, and tech setup
Troubleshoot tasks independently—think strategically and execute without asking "how"
Table Stakes:

Proven experience as an Executive Assistant or in a high-performance operations or marketing support role
Expert-level skills in Apollo, RocketReach, Hunter.io, LinkedIn, ZeroBounce, Lemlist, and GoDaddy
Strong grasp of email marketing workflows, lead validation, and CRM hygiene
Demonstrated ability to figure out vague or loosely defined tasks and produce results without constant guidance
Fluent in Google Workspace, Notion, Zoom, Canva, etc.
AI-savvy—comfortable working with AI tools, crafting effective prompts, and understanding how to train/customize AI models for productivity
Strong written and verbal communication in English
Bonus: Familiarity with SaaS, telecom, or restaurant tech industries
Benefits:

Service Incentive Leave (SIL) after 6 months
HMO after 6 months
13th month pay
Allowances

Schedule:

8 hour Shift
Graveyard

Application Question(s):

Rate your English speaking skills from 1-10. 10 being the best
Rate your English writing skills from 1-10. 10 being the best
This requires working the night shift. Are you OK with this?
Have you ever worked for a US Executive before?
Job Type:

Full-time, Onsite (Cebu Based)

Experience:

Executive Assistant: 2 years (Required)

The ideal candidate is resourceful, AI-savvy, lead-gen fluent, and operates with extreme ownership. If you can take a task with minimal context and deliver results—this role is for you.

Be so good that you can’t be ignored!

Join Vivant and take your career to the next level!

Tip:
When applying, please include relevant data about your past successful campaign and the results, not the process.Due to the extensive number of resumes, we look for relevant experience, success in past campaigns, and an understanding of marketing when deciding which candidates to interview.

Job Types: Full-time, Permanent

Pay: Php25,000.00 - Php50,000.00 per month

Benefits:

Company Christmas gift
Company events
Health insurance
Paid training
Ability to commute/relocate:

Cebu City: Reliably commute or planning to relocate before starting work (Required)
Experience:

Executive Assistance: 2 years (Required)
Customer service: 3 years (Required)
Language:

English (Required)
Location:

Cebu City (Required)
`,
      jobSkills: ["Inventory Handling", "Teamwork", "Perseverance", "meowmeow"],
      location: {
        city: "Caloocan",
        state: "Metro Manila",
        postalCode: "1400",
      },
      employment: ["Full-time", "Part Time"],
      workTypes: ["Onsite", "Remote"],
      salaryRange: {
        min: 12000,
        max: 16000,
        currency: "PHP",
        frequency: "month",
      },
      jobNormalized: "warehouse personnel",
      profilePic:
        "https://ik.imagekit.io/mnv8wgsbk/Public%20Images/placeholder.png?updatedAt=1756757645263",
      isExternal: false,
      status: true,
    },
    {
      jobUID: "job28",
      score: 0.63,
      feedback: {
        match_summary:
          "Data entry and inventory tracking role in a warehouse setting.",
        skill_note:
          "Requires data entry and inventory tracking skills. Consider developing skills in data management.",
        extra_note:
          "No related certifications, but this could still be a solid entry point.",
      },
      boostWeight: 0.0,
      _id: "job28",
      jobPoster: "EMP028",
      jobTitle: "Warehouse Clerk",
      jobIndustry: "Logistics / Delivery",
      jobDescription:
        "['Maintain records of warehouse inventory.', 'Assist with receiving and dispatching goods.', 'Prepare reports on stock levels.']",
      jobSkills: ["Inventory Tracking", "Data Entry"],
      location: {
        city: "Meycauayan",
        state: "Bulacan",
        postalCode: "3020",
      },
      employment: ["Full-time"],
      workTypes: ["Onsite"],
      salaryRange: {
        min: 7000,
        max: 11000,
        currency: "PHP",
        frequency: "year",
      },
      jobNormalized: "warehouse clerk",
      profilePic: "indeed",
      isExternal: true,
      status: true,
    },
  ]);

  console.log('------------jobpostings ', jobPostings.length)

  // Filter
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({});


  //For Card Swiping & Bottom Sheets effect of it
  const [showModal, setShowModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  //for Filtering & Search
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const [userSearch, setUserSearch] = useState("");
  const [tempSearch, setTempSearch] = useState<BrowseScreenTypes['userSearch']>();

  console.log(jobPostings.length)

  //for SWIPING LOGIC with backend
  const [skipped, setSkipped] = useState([])

  console.log(skipped,'-skiped')

  


  //For query
  const userProfile = {
    seekerUID: userMDB?.seekerUID,
    skills: userMDB?.skills,
    profileSummary: userMDB?.profileSummary,
    industries: userMDB?.industries,
    skippedJobs: userMDB?.skippedJobs,
    experience: userMDB?.experience,
    certifications: userMDB?.certifications,
  };
  console.log(userProfile,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')

  console.log(tempSearch);

  function handleBG() {
    setShowModal(false);
    setShowFilter(false);
    setShowSearch(false);
    if (showSearch) {
      setShowFilter(true);
    }
  }

  return (
    <SafeAreaView className="bg-white" style={{ flex: 1 }}>
      <Header />

      <View className="flex-row justify-between px-6">
        <Text
          style={{
            fontFamily: "Poppins-Bold",
            fontSize: 24,
            color: "#37424F",
          }}
        >
          Find Jobs
        </Text>

        {/* For Filtering & Searchng */}
        <Pressable
          onPress={() => setShowFilter(true)}
          className="w-[62%] rounded-xl justify-center p-2"
          style={{ backgroundColor: "#EFEFEF" }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Search />
              <Text className="font-lexend color-slate-600 text-base">
                {(userSearch || "Search Here").length > 16
                  ? (userSearch || "Search Here").slice(0, 16) + "..."
                  : userSearch || "Search Here"}
              </Text>
            </View>
            <SlidersHorizontal width={18} />
          </View>
        </Pressable>
      </View>

      {jobPostings.length === 0 ?
        <Text className="text-center">Hello</Text>
        :
        <CardSwipe
          showModal={showModal}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          setShowModal={setShowModal}
          jobPostings={jobPostings}
          setJobPostings={setJobPostings}
          setShortlistedJobs={setShortlistedJobs}
          setSkipped={setSkipped}
        />

      }

      {/* Search And Filtering Components  */}
      <Filtering
        tempSearch={tempSearch}
        showFilter={showFilter}
        selected={selected}
        userSearch={userSearch}
        setSelected={setSelected}
        setShowSearch={setShowSearch}
        setUserSearch={setUserSearch}
        setShowFilter={setShowFilter}
        //userSearch
        userProfile={userProfile}
        //for JOB LISTINGS
        setJobPostings={setJobPostings}
      />
      <SearchSheet
        setShowSearch={setShowSearch}
        setTempSearch={setTempSearch}
        tempSearch={tempSearch}
        showSearch={showSearch}
      />

      {/* for the black screen */}
      {(showModal || showFilter || showSearch) && (
        <Pressable
          onPress={handleBG}
          className="absolute inset-0 bg-black z-[100]"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        />
      )}
    </SafeAreaView>
  );
};
