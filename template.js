/**
 * Blank AHS JSON structure matching the Filler output format.
 */
export function blankAHS() {
  return {
    prefilled: {
      "1.1": "",
      "1.2": "",
      "1.3": "",
      "1.4": "",
      "2.1": "",
      "2.2": "",
      "2.3": "",
      "2.4": "",
      "2.5": "",
      "2.6": "",
      "2.7": "",
      "2.8": { start: "", end: "", days: [] },
      "2.9": { checked: [], other: null },
      "2.10": { name: "", review_style: "" },
      "2.11": "",
      "3.1": "",
      "3.2": "",
      "3.3": "",
      "3.4": "",
      "4": [
        {
          "4.1": "",
          "4.2": "",
          "4.3": [],
          "4.4": "",
          "4.5": "",
          "4.6": "",
          "4.7": "",
          "4.8": [],
          "search_hints": []
        }
      ],
      "5.1": { chips: [], free_text: null },
      "5.2": "",
      "5.3": "",
      "5.4": "",
      "5.5": "",
      "5.6": { choice: "", other_text: null },
      "5.7": { frequency: "", content: "" },
      "5.8": "",
      "6.1": "",
      "6.2": "",
      "6.3": "",
      "6.4": ""
    },
    checklist: {
      filled: [],
      needs_human: [
        "1.1 Job Title",
        "1.2 Mission Statement",
        "1.3 Key Responsibilities",
        "1.4 Boundaries",
        "2.1 Your Full Name",
        "2.2 Your Role/Title",
        "2.3 Company Name",
        "2.4 Industry",
        "2.5 Company Size",
        "2.6 Business Context",
        "2.7 Timezone",
        "2.8 Working Hours",
        "2.9 Tools You Use",
        "2.10 Who Reviews the Work",
        "2.11 Preferred Channel",
        "3.1 Dealbreakers",
        "3.2 Tolerable Mistakes",
        "3.3 Past Failures",
        "3.4 Confidentiality Rules",
        "4 Skills (at least 2)",
        "5.1 Tone",
        "5.2 Decision Freedom",
        "5.3 Daily Routine",
        "5.4 Escalation Triggers",
        "5.5 KPIs",
        "5.6 Silence Handling",
        "5.7 Reporting",
        "5.8 Improvement Areas",
        "6.1 Regulations",
        "6.4 Anything Else"
      ],
      recommended_attachments: []
    }
  };
}
