// ─── State ──────────────────────────────────────────
let formData = null;
let saveTimeout = null;
let selectedChannel = "";
let selectedDecision = "";
let selectedSilence = "";
let selectedTones = [];
let skillCount = 0;

// ─── Tools categories ───────────────────────────────
const TOOLS = {
  "Communication": ["Slack","Microsoft Teams","Gmail","Outlook","WhatsApp Business","Telegram","Discord","Intercom","Zendesk","Front","Crisp"],
  "CRM & Sales": ["HubSpot","Salesforce","Pipedrive","Close","Zoho CRM","Freshsales","Apollo","Outreach"],
  "Project Management": ["Asana","Trello","Monday.com","ClickUp","Jira","Linear","Basecamp","Notion","Todoist"],
  "Documents & Knowledge": ["Google Docs","Google Sheets","Microsoft Word","Microsoft Excel","Notion","Confluence","Airtable","Coda"],
  "Marketing": ["Mailchimp","ConvertKit","ActiveCampaign","Klaviyo","Buffer","Hootsuite","Canva","WordPress","Webflow","Shopify"],
  "Finance & Accounting": ["QuickBooks","Xero","Stripe","FreshBooks","Wave","PayPal"],
  "Calendar & Scheduling": ["Google Calendar","Outlook Calendar","Calendly","Cal.com","SavvyCal"],
  "File Storage": ["Google Drive","Dropbox","OneDrive","Box"],
  "Analytics": ["Google Analytics","Mixpanel","Amplitude","Hotjar","Plausible"],
  "Customer Support": ["Freshdesk","Help Scout"],
  "Development": ["GitHub","GitLab","Vercel","Netlify","AWS Console"],
  "Social Media": ["LinkedIn","Twitter/X","Instagram","Facebook","TikTok","YouTube"]
};

const TONE_CHIPS = ["Professional","Friendly","Direct","Casual","Formal","Warm","Concise","Detailed","Enthusiastic","Measured","Empathetic","Assertive","Playful","Diplomatic","No-nonsense"];

const FREQ_OPTIONS = ["Multiple times per day","Daily","A few times per week","Weekly","Bi-weekly","Monthly","As needed (triggered by events)"];

// ─── Init ───────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  buildToolsGrid();
  buildToneChips();
  buildTimezoneDropdown();
  setupIndustryOther();
  setupChannelButtons();
  setupRadioCards("decision-cards", v => { selectedDecision = v; scheduleSave(); });
  setupRadioCards("silence-cards", v => {
    selectedSilence = v;
    document.getElementById("f-5.6-other").style.display = v === "__other" ? "" : "none";
    scheduleSave();
  });
  setupDayToggles();
  setupWizardNav();
  setupAutoSave();

  // Load existing data
  try {
    const res = await fetch("/api/ahs");
    if (res.ok) {
      formData = await res.json();
      loadFormData(formData);
    }
  } catch { /* fresh start */ }

  // Start with 2 skill blocks
  if (skillCount === 0) { addSkill(); addSkill(); }


});

// ─── Wizard navigation ──────────────────────────────
let currentStep = 0;

function setupWizardNav() {
  document.querySelectorAll(".step-dot[data-step]").forEach(dot => {
    dot.addEventListener("click", () => {
      const step = parseInt(dot.dataset.step);
      if (step <= currentStep + 1) goStep(step); // can go forward one or back any
    });
  });
}

function goStep(n) {
  // Save before leaving
  if (currentStep >= 1 && currentStep <= 6) scheduleSave();

  // Update generate summary on step 7
  if (n === 7) buildGenerateSummary();

  // Switch step visibility
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(`step-${n}`);
  if (target) target.classList.add("active");

  // Update progress dots
  document.querySelectorAll(".step-dot").forEach(dot => {
    const dotStep = parseInt(dot.dataset.step);
    dot.classList.remove("active", "done");
    if (dotStep === n) dot.classList.add("active");
    else if (dotStep < n) dot.classList.add("done");
  });

  // Update progress lines
  const lines = document.querySelectorAll(".step-line");
  const dots = document.querySelectorAll(".step-dot");
  lines.forEach((line, i) => {
    line.classList.toggle("done", i < n);
  });

  currentStep = n;
  window.scrollTo(0, 0);
}

// ─── Tools grid ─────────────────────────────────────
function buildToolsGrid() {
  const container = document.getElementById("tools-grid");
  const seen = new Set();
  for (const [category, tools] of Object.entries(TOOLS)) {
    const details = document.createElement("details");
    details.className = "tool-category";
    details.open = false;
    const summary = document.createElement("summary");
    summary.textContent = category;
    details.appendChild(summary);

    const grid = document.createElement("div");
    grid.className = "checkbox-grid";
    for (const tool of tools) {
      if (seen.has(tool)) continue;
      seen.add(tool);
      const lbl = document.createElement("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = tool;
      cb.className = "tool-cb";
      cb.addEventListener("change", scheduleSave);
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(" " + tool));
      grid.appendChild(lbl);
    }
    details.appendChild(grid);
    container.appendChild(details);
  }
}

// ─── Tone chips ─────────────────────────────────────
function buildToneChips() {
  const container = document.getElementById("tone-chips");
  for (const t of TONE_CHIPS) {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = t;
    chip.addEventListener("click", () => {
      if (chip.classList.contains("selected")) {
        chip.classList.remove("selected");
        selectedTones = selectedTones.filter(x => x !== t);
      } else if (selectedTones.length < 5) {
        chip.classList.add("selected");
        selectedTones.push(t);
      }
      document.getElementById("tone-count").textContent = `${selectedTones.length} of 2-5 selected`;
      // Disable unselected if at 5
      container.querySelectorAll(".chip").forEach(c => {
        c.classList.toggle("disabled", selectedTones.length >= 5 && !c.classList.contains("selected"));
      });
      scheduleSave();
    });
    container.appendChild(chip);
  }
}

// ─── Timezone ───────────────────────────────────────
function buildTimezoneDropdown() {
  const sel = document.getElementById("f-2.7");
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const common = ["US/Eastern","US/Central","US/Mountain","US/Pacific","Europe/London","Europe/Paris","Europe/Berlin","Asia/Dubai","Asia/Kolkata","Asia/Singapore","Asia/Tokyo","Australia/Sydney"];

  // Add common first
  const optCommon = document.createElement("optgroup");
  optCommon.label = "Common";
  for (const tz of common) {
    const o = document.createElement("option");
    o.value = tz; o.textContent = tz;
    if (tz === detected) o.selected = true;
    optCommon.appendChild(o);
  }
  sel.appendChild(optCommon);

  // Add all IANA timezones
  try {
    const all = Intl.supportedValuesOf("timeZone");
    const groups = {};
    for (const tz of all) {
      const region = tz.split("/")[0];
      if (!groups[region]) groups[region] = [];
      groups[region].push(tz);
    }
    for (const [region, tzList] of Object.entries(groups).sort()) {
      const grp = document.createElement("optgroup");
      grp.label = region;
      for (const tz of tzList) {
        const o = document.createElement("option");
        o.value = tz; o.textContent = tz;
        if (tz === detected && !common.includes(tz)) o.selected = true;
        grp.appendChild(o);
      }
      sel.appendChild(grp);
    }
  } catch {
    // Fallback: just use common list
  }

  // If detected timezone wasn't in common, select it
  if (detected && sel.value !== detected) sel.value = detected;
}

// ─── Industry "Other" ───────────────────────────────
function setupIndustryOther() {
  const sel = document.getElementById("f-2.4");
  const other = document.getElementById("f-2.4-other");
  sel.addEventListener("change", () => {
    other.style.display = sel.value === "__other" ? "" : "none";
    scheduleSave();
  });
}

// ─── Channel buttons ────────────────────────────────
function setupChannelButtons() {
  document.querySelectorAll("#channel-group .channel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#channel-group .channel-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedChannel = btn.dataset.val;
      document.getElementById("f-2.11-other").style.display = selectedChannel === "__other" ? "" : "none";
      scheduleSave();
    });
  });
}

// ─── Radio cards ────────────────────────────────────
function setupRadioCards(containerId, onChange) {
  document.querySelectorAll(`#${containerId} .radio-card`).forEach(card => {
    card.addEventListener("click", () => {
      document.querySelectorAll(`#${containerId} .radio-card`).forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      onChange(card.dataset.val);
    });
  });
}

// ─── Day toggles ────────────────────────────────────
function setupDayToggles() {
  document.querySelectorAll("#day-toggles .day-toggle").forEach(d => {
    d.addEventListener("click", () => {
      d.classList.toggle("on");
      scheduleSave();
    });
  });
}

// ─── Skills ─────────────────────────────────────────
function addSkill() {
  if (skillCount >= 6) return;
  skillCount++;
  const idx = skillCount;
  const container = document.getElementById("skills-container");

  const block = document.createElement("div");
  block.className = "skill-block";
  block.id = `skill-${idx}`;
  block.innerHTML = `
    <div class="skill-header" onclick="toggleSkill(${idx})">
      <h3>Skill ${idx} <span class="skill-title-preview"></span></h3>
      <div class="actions">
        ${skillCount > 2 ? `<button class="btn btn-danger btn-sm" onclick="event.stopPropagation();removeSkill(${idx})">Remove</button>` : ""}
      </div>
    </div>
    <div class="skill-body">
      <div class="field-group">
        <label>Skill Name <span class="req">*</span></label>
        <div class="helper">Name this process. Action-oriented -- "Inbound Lead Qualification" not "Leads."</div>
        <input type="text" class="skill-name" data-idx="${idx}" placeholder="Inbound Lead Qualification" oninput="updateSkillTitle(${idx})">
      </div>
      <div class="field-group">
        <label>Trigger <span class="req">*</span></label>
        <div class="helper">What kicks off this skill? A schedule, an event, a condition?</div>
        <textarea class="skill-trigger" data-idx="${idx}" placeholder="New lead enters via website form, gets added to CRM, or emails us directly. Also when a quiet lead follows up."></textarea>
      </div>
      <div class="field-group">
        <label>Steps <span class="req">*</span></label>
        <div class="helper">The actual process, step by step. One action per step.</div>
        <div class="steps-list" id="steps-${idx}">
          <div class="step-row"><span class="step-num">1</span><input type="text" placeholder="Check CRM for new leads since last check"><button class="remove-step" onclick="removeStep(${idx},this)" title="Remove">&times;</button></div>
          <div class="step-row"><span class="step-num">2</span><input type="text" placeholder="Research company -- website, LinkedIn, size, fit"><button class="remove-step" onclick="removeStep(${idx},this)" title="Remove">&times;</button></div>
          <div class="step-row"><span class="step-num">3</span><input type="text" placeholder="Score against ICP checklist"><button class="remove-step" onclick="removeStep(${idx},this)" title="Remove">&times;</button></div>
        </div>
        <button class="btn btn-sm" onclick="addStep(${idx})" style="margin-top:8px">+ Add step</button>
      </div>
      <div class="field-group">
        <label>Quality Bar <span class="req">*</span></label>
        <div class="helper">What does "done well" look like? Specific standards -- accuracy, speed, format.</div>
        <textarea class="skill-quality" data-idx="${idx}" placeholder="Personalized email sent within 2 hours. CRM updated same-day with score, reasoning, and next action. Zero leads sitting in 'New' for more than 4 hours."></textarea>
      </div>
      <div class="field-group">
        <label>Common Failures <span class="req">*</span></label>
        <div class="helper">How does this go wrong? What mistakes should your agent watch for?</div>
        <textarea class="skill-failures" data-idx="${idx}" placeholder="- Generic template with no real personalization -- kills response rates&#10;- Scoring 'Hot' just because the company is big, without checking ICP fit&#10;- Spending 30 min researching one lead (10 min max, we need volume)&#10;- Forgetting to update CRM -- sales team flies blind"></textarea>
      </div>
      <div class="field-group">
        <label>Output Goes To <span class="req">*</span></label>
        <div class="helper">Who uses what this skill produces?</div>
        <input type="text" class="skill-audience" data-idx="${idx}" placeholder="Sales team (Jake & Maria) reviews qualified leads in CRM. Prospects receive outreach emails directly.">
      </div>
      <div class="field-group">
        <label>Frequency <span class="req">*</span></label>
        <select class="skill-freq" data-idx="${idx}">
          <option value="">How often?</option>
          ${FREQ_OPTIONS.map(f => `<option>${f}</option>`).join("")}
        </select>
      </div>
    </div>
  `;
  container.appendChild(block);

  // Listen for changes in skill fields
  block.querySelectorAll("input, textarea, select").forEach(el => {
    el.addEventListener("input", scheduleSave);
    el.addEventListener("change", scheduleSave);
  });

  document.getElementById("add-skill-btn").style.display = skillCount >= 6 ? "none" : "";
}

function removeSkill(idx) {
  if (skillCount <= 2) return;
  document.getElementById(`skill-${idx}`).remove();
  skillCount--;
  document.getElementById("add-skill-btn").style.display = skillCount >= 6 ? "none" : "";
  // Renumber remaining
  let num = 0;
  document.querySelectorAll(".skill-block").forEach(block => {
    num++;
    block.querySelector("h3").childNodes[0].textContent = `Skill ${num} `;
  });
  scheduleSave();
}

function toggleSkill(idx) {
  document.getElementById(`skill-${idx}`).classList.toggle("collapsed");
}

function updateSkillTitle(idx) {
  const name = document.querySelector(`.skill-name[data-idx="${idx}"]`).value;
  const preview = document.querySelector(`#skill-${idx} .skill-title-preview`);
  preview.textContent = name ? `-- ${name}` : "";
}

function addStep(idx) {
  const list = document.getElementById(`steps-${idx}`);
  const count = list.children.length;
  if (count >= 15) return;
  const row = document.createElement("div");
  row.className = "step-row";
  row.innerHTML = `<span class="step-num">${count + 1}</span><input type="text" placeholder="Next step..."><button class="remove-step" onclick="removeStep(${idx},this)" title="Remove step">&times;</button>`;
  row.querySelector("input").addEventListener("input", scheduleSave);
  list.appendChild(row);
}

function removeStep(idx, btn) {
  const list = document.getElementById(`steps-${idx}`);
  if (list.children.length <= 3) return;
  btn.closest(".step-row").remove();
  // Renumber
  let n = 0;
  list.querySelectorAll(".step-num").forEach(s => { n++; s.textContent = n; });
  scheduleSave();
}

// ─── Auto-save ──────────────────────────────────────
function setupAutoSave() {
  document.querySelectorAll("input[type='text'], textarea, select, input[type='time']").forEach(el => {
    el.addEventListener("input", scheduleSave);
    el.addEventListener("change", scheduleSave);
  });

  // Char counts
  document.querySelectorAll("input[maxlength], textarea[maxlength]").forEach(el => {
    const counter = el.closest(".field-group")?.querySelector(".count");
    if (counter) {
      el.addEventListener("input", () => { counter.textContent = el.value.length; });
    }
  });
}

function scheduleSave() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(doSave, 1500);

}

async function doSave() {
  const data = collectFormData();
  showSaveStatus("saving", "Saving...");
  try {
    const res = await fetch("/api/ahs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      showSaveStatus("saved", "Saved");
    } else {
      showSaveStatus("error", "Save failed");
    }
  } catch {
    showSaveStatus("error", "Save failed");
  }
}

function showSaveStatus(cls, text) {
  const el = document.getElementById("save-status");
  el.className = `save-status ${cls}`;
  el.textContent = text;
  if (cls === "saved") {
    setTimeout(() => el.classList.add("hidden"), 2000);
  }
}

// ─── Collect data ───────────────────────────────────
function collectFormData() {
  const v = id => document.getElementById(id)?.value || "";

  const industry = v("f-2.4") === "__other" ? v("f-2.4-other") : v("f-2.4");

  // Tools
  const checkedTools = [];
  document.querySelectorAll(".tool-cb:checked").forEach(cb => checkedTools.push(cb.value));
  const otherTools = v("f-2.9-other");
  const tools = { checked: checkedTools, other: otherTools || null };

  // Working hours
  const days = [];
  document.querySelectorAll("#day-toggles .day-toggle.on").forEach(d => days.push(d.dataset.day));

  // Channel
  const channel = selectedChannel === "__other" ? v("f-2.11-other") : selectedChannel;

  // Silence
  const silence = selectedSilence === "__other"
    ? { choice: "Other", other_text: v("f-5.6-other") }
    : { choice: selectedSilence, other_text: null };

  // Skills
  const skills = [];
  document.querySelectorAll(".skill-block").forEach(block => {
    const idx = block.querySelector(".skill-name")?.dataset.idx;
    if (!idx) return;
    const steps = [];
    block.querySelectorAll(`#steps-${idx} input`).forEach(inp => { if (inp.value.trim()) steps.push(inp.value.trim()); });
    skills.push({
      "4.1": block.querySelector(".skill-name")?.value || "",
      "4.2": block.querySelector(".skill-trigger")?.value || "",
      "4.3": steps,
      "4.4": block.querySelector(".skill-quality")?.value || "",
      "4.5": block.querySelector(".skill-failures")?.value || "",
      "4.6": block.querySelector(".skill-audience")?.value || "",
      "4.7": block.querySelector(".skill-freq")?.value || "",
      "4.8": [],
      "search_hints": JSON.parse(block.dataset.searchHints || "[]")
    });
  });

  return {
    prefilled: {
      "1.1": v("f-1.1"),
      "1.2": v("f-1.2"),
      "1.3": v("f-1.3"),
      "1.4": v("f-1.4"),
      "2.1": v("f-2.1"),
      "2.2": v("f-2.2"),
      "2.3": v("f-2.3"),
      "2.4": industry,
      "2.5": v("f-2.5"),
      "2.6": v("f-2.6"),
      "2.7": v("f-2.7"),
      "2.8": { start: v("f-2.8-start"), end: v("f-2.8-end"), days },
      "2.9": tools,
      "2.10": { name: v("f-2.10-name"), review_style: v("f-2.10-style") },
      "2.11": channel,
      "3.1": v("f-3.1"),
      "3.2": v("f-3.2"),
      "3.3": v("f-3.3"),
      "3.4": v("f-3.4"),
      "4": skills,
      "5.1": { chips: selectedTones, free_text: v("f-5.1-text") },
      "5.2": selectedDecision,
      "5.3": v("f-5.3"),
      "5.4": v("f-5.4"),
      "5.5": v("f-5.5"),
      "5.6": silence,
      "5.7": { frequency: v("f-5.7-freq"), content: v("f-5.7-content") },
      "5.8": v("f-5.8"),
      "6.1": v("f-6.1"),
      "6.2": v("f-6.2"),
      "6.3": v("f-6.3"),
      "6.4": v("f-6.4")
    },
    checklist: { filled: [], needs_human: [], recommended_attachments: [] }
  };
}

// ─── Load data ──────────────────────────────────────
function loadFormData(data) {
  const p = data.prefilled || data;
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.value = val; };

  set("f-1.1", p["1.1"]);
  set("f-1.2", p["1.2"]);
  set("f-1.3", p["1.3"]);
  set("f-1.4", p["1.4"]);
  set("f-2.1", p["2.1"]);
  set("f-2.2", p["2.2"]);
  set("f-2.3", p["2.3"]);

  // Industry
  if (p["2.4"]) {
    const sel = document.getElementById("f-2.4");
    const match = [...sel.options].find(o => o.value === p["2.4"]);
    if (match) { sel.value = p["2.4"]; }
    else { sel.value = "__other"; document.getElementById("f-2.4-other").value = p["2.4"]; document.getElementById("f-2.4-other").style.display = ""; }
  }

  set("f-2.5", p["2.5"]);
  set("f-2.6", p["2.6"]);
  if (p["2.7"]) set("f-2.7", p["2.7"]);

  // Working hours
  if (p["2.8"]) {
    if (typeof p["2.8"] === "object") {
      set("f-2.8-start", p["2.8"].start);
      set("f-2.8-end", p["2.8"].end);
      if (p["2.8"].days) {
        document.querySelectorAll("#day-toggles .day-toggle").forEach(d => {
          d.classList.toggle("on", p["2.8"].days.includes(d.dataset.day));
        });
      }
    } else {
      // String format from filler
      set("f-2.8-start", "09:00");
      set("f-2.8-end", "18:00");
    }
  }

  // Tools — accept both {checked, other} and plain array
  if (p["2.9"]) {
    let checkedArr, otherStr;
    if (Array.isArray(p["2.9"])) {
      checkedArr = p["2.9"];
      otherStr = null;
    } else {
      checkedArr = p["2.9"].checked || [];
      otherStr = p["2.9"].other || null;
    }
    const unknownTools = [];
    for (const t of checkedArr) {
      const cb = document.querySelector(`.tool-cb[value="${CSS.escape(t)}"]`);
      if (cb) cb.checked = true;
      else unknownTools.push(t);
    }
    const allOther = [...unknownTools, ...(otherStr ? otherStr.split(",").map(s => s.trim()).filter(Boolean) : [])];
    if (allOther.length) document.getElementById("f-2.9-other").value = allOther.join(", ");
  }

  // Review
  if (p["2.10"]) {
    if (typeof p["2.10"] === "object") {
      set("f-2.10-name", p["2.10"].name);
      set("f-2.10-style", p["2.10"].review_style);
    } else {
      set("f-2.10-name", p["2.10"]);
    }
  }

  // Channel
  if (p["2.11"]) {
    const btn = document.querySelector(`#channel-group .channel-btn[data-val="${p["2.11"]}"]`);
    if (btn) { btn.click(); }
    else {
      document.querySelector(`#channel-group .channel-btn[data-val="__other"]`).click();
      document.getElementById("f-2.11-other").value = p["2.11"];
    }
  }

  set("f-3.1", p["3.1"]);
  set("f-3.2", p["3.2"]);
  set("f-3.3", p["3.3"]);
  set("f-3.4", p["3.4"]);

  // Skills
  if (Array.isArray(p["4"]) && p["4"].length > 0) {
    // Remove default skills
    document.getElementById("skills-container").innerHTML = "";
    skillCount = 0;
    for (const skill of p["4"]) {
      addSkill();
      const idx = skillCount;
      const block = document.getElementById(`skill-${idx}`);
      if (!block) continue;
      const q = (cls) => block.querySelector(`.${cls}[data-idx="${idx}"]`);
      if (q("skill-name")) q("skill-name").value = skill["4.1"] || "";
      if (q("skill-trigger")) q("skill-trigger").value = skill["4.2"] || "";
      if (q("skill-quality")) q("skill-quality").value = skill["4.4"] || "";
      if (q("skill-failures")) q("skill-failures").value = skill["4.5"] || "";
      if (q("skill-audience")) q("skill-audience").value = skill["4.6"] || "";
      if (q("skill-freq")) q("skill-freq").value = skill["4.7"] || "";

      // Steps
      const steps = Array.isArray(skill["4.3"]) ? skill["4.3"] : [];
      if (steps.length > 0) {
        const list = document.getElementById(`steps-${idx}`);
        list.innerHTML = "";
        steps.forEach((step, i) => {
          const row = document.createElement("div");
          row.className = "step-row";
          row.innerHTML = `<span class="step-num">${i + 1}</span><input type="text" value=""><button class="remove-step" onclick="removeStep(${idx},this)" title="Remove step">&times;</button>`;
          row.querySelector("input").value = step;
          row.querySelector("input").addEventListener("input", scheduleSave);
          list.appendChild(row);
        });
      }

      // Store search_hints as hidden data on the block
      if (skill.search_hints) block.dataset.searchHints = JSON.stringify(skill.search_hints);

      updateSkillTitle(idx);
    }
    // Ensure minimum 2
    while (skillCount < 2) addSkill();
  }

  // Tone
  if (p["5.1"]) {
    let chips, text;
    if (typeof p["5.1"] === "object" && !Array.isArray(p["5.1"])) {
      chips = p["5.1"].chips || [];
      text = p["5.1"].free_text || "";
    } else if (Array.isArray(p["5.1"])) {
      chips = p["5.1"];
      text = "";
    }
    if (chips) {
      selectedTones = [];
      document.querySelectorAll("#tone-chips .chip").forEach(c => {
        if (chips.includes(c.textContent)) {
          c.classList.add("selected");
          selectedTones.push(c.textContent);
        }
      });
      document.getElementById("tone-count").textContent = `${selectedTones.length} of 2-5 selected`;
    }
    if (text) set("f-5.1-text", text);
  }

  // Decision
  if (p["5.2"]) {
    const card = document.querySelector(`#decision-cards .radio-card[data-val="${p["5.2"]}"]`);
    if (card) card.click();
  }

  set("f-5.3", p["5.3"]);
  set("f-5.4", p["5.4"]);
  set("f-5.5", p["5.5"]);

  // Silence
  if (p["5.6"]) {
    if (typeof p["5.6"] === "object") {
      const card = document.querySelector(`#silence-cards .radio-card[data-val="${p["5.6"].choice === "Other" ? "__other" : p["5.6"].choice}"]`);
      if (card) card.click();
      if (p["5.6"].other_text) set("f-5.6-other", p["5.6"].other_text);
    } else {
      const card = document.querySelector(`#silence-cards .radio-card[data-val="${p["5.6"]}"]`);
      if (card) card.click();
    }
  }

  // Reporting
  if (p["5.7"]) {
    if (typeof p["5.7"] === "object") {
      set("f-5.7-freq", p["5.7"].frequency);
      set("f-5.7-content", p["5.7"].content);
    } else {
      set("f-5.7-freq", p["5.7"]);
    }
  }

  set("f-5.8", p["5.8"]);
  set("f-6.1", typeof p["6.1"] === "object" ? p["6.1"].text || "" : p["6.1"]);
  set("f-6.2", typeof p["6.2"] === "object" ? p["6.2"].text || "" : Array.isArray(p["6.2"]) ? "" : p["6.2"]);
  set("f-6.3", typeof p["6.3"] === "object" ? p["6.3"].text || "" : Array.isArray(p["6.3"]) ? "" : p["6.3"]);
  set("f-6.4", p["6.4"]);

  // Update char counts
  document.querySelectorAll("input[maxlength], textarea[maxlength]").forEach(el => {
    const counter = el.closest(".field-group")?.querySelector(".count");
    if (counter) counter.textContent = el.value.length;
  });
}

// ─── LLM config ─────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/config");
    const data = await res.json();
    if (data.configured) {
      const status = document.getElementById("llm-status");
      if (status) { status.textContent = `Connected (${data.provider})`; status.className = "connected"; }
      const sel = document.getElementById("llm-provider");
      if (sel) sel.value = data.provider;
    }
  } catch {}
});

async function saveLLMConfig() {
  const provider = document.getElementById("llm-provider").value;
  const apiKey = document.getElementById("llm-key").value.trim();
  const status = document.getElementById("llm-status");

  if (!provider || !apiKey) { status.textContent = "Select a provider and enter your key."; status.style.color = "var(--danger)"; return; }

  try {
    const res = await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, apiKey })
    });
    const data = await res.json();
    if (res.ok) {
      status.textContent = `Connected (${provider})`;
      status.style.color = "var(--success)";
      status.className = "connected";
      document.getElementById("llm-key").value = "";
    } else {
      status.textContent = data.error;
      status.style.color = "var(--danger)";
    }
  } catch (err) {
    status.textContent = err.message;
    status.style.color = "var(--danger)";
  }
}

// ─── Fill from job posting ──────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fill-file");
  if (fileInput) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      document.getElementById("fill-filename").textContent = file ? file.name : "";
      // For .txt and .md, read as text. For .pdf/.docx, we'll send the text from the textarea.
      if (file && (file.name.endsWith(".txt") || file.name.endsWith(".md"))) {
        const reader = new FileReader();
        reader.onload = () => { document.getElementById("fill-text").value = reader.result; };
        reader.readAsText(file);
      } else if (file) {
        document.getElementById("fill-text").placeholder = `File "${file.name}" selected. For PDF/DOCX, paste the text content or use the CLI: ahs fill ${file.name}`;
      }
    });
  }
});

async function runFill() {
  const text = document.getElementById("fill-text").value.trim();
  const status = document.getElementById("fill-status");
  const btn = document.getElementById("fill-btn");

  if (!text) {
    status.style.display = "";
    status.style.color = "var(--danger)";
    status.textContent = "Paste or type the job posting text first.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Working...";
  status.style.display = "";
  status.style.color = "var(--primary)";
  status.textContent = "Sending to LLM for extraction... this may take 30-60 seconds.";

  try {
    const res = await fetch("/api/fill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    if (!res.ok) {
      status.style.color = "var(--danger)";
      status.textContent = data.error || "Fill failed.";
      btn.disabled = false;
      btn.textContent = "Pre-fill from posting";
      return;
    }

    // Load the prefilled data into the form
    loadFormData(data);
  

    const filled = data.checklist?.filled?.length || 0;
    const needs = data.checklist?.needs_human?.length || 0;
    status.style.color = "var(--success)";
    status.textContent = `Done! ${filled} fields pre-filled, ${needs} still need your input. Review each section below.`;
  } catch (err) {
    status.style.color = "var(--danger)";
    status.textContent = `Error: ${err.message}`;
  }

  btn.disabled = false;
  btn.textContent = "Pre-fill from posting";
}

// ─── File upload ────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("ref-files");
  if (fileInput) {
    fileInput.addEventListener("change", uploadFiles);
  }
  // Load existing uploaded files
  loadUploadedFiles();
});

async function uploadFiles() {
  const fileInput = document.getElementById("ref-files");
  const list = document.getElementById("upload-list");
  const files = fileInput.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (const file of files) {
    formData.append("files", file, file.name);
  }

  list.textContent = "Uploading...";

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      list.textContent = `Upload failed: ${data.error}`;
      return;
    }
    fileInput.value = "";
    loadUploadedFiles();
  } catch (err) {
    list.textContent = `Upload failed: ${err.message}`;
  }
}

async function loadUploadedFiles() {
  const list = document.getElementById("upload-list");
  if (!list) return;
  try {
    const res = await fetch("/api/files");
    const data = await res.json();
    if (data.files.length === 0) {
      list.textContent = "No files uploaded yet.";
      return;
    }
    list.innerHTML = data.files.map(f =>
      `<div style="display:flex;align-items:center;gap:6px;padding:2px 0"><span style="font-family:var(--mono);font-size:12px">${f}</span></div>`
    ).join("");
  } catch { list.textContent = ""; }
}

// ─── Generate summary ───────────────────────────────
function buildGenerateSummary() {
  const v = id => (document.getElementById(id)?.value || "").trim();
  const summary = document.getElementById("generate-summary");
  if (!summary) return;

  const title = v("f-1.1") || "(no title)";
  const name = v("f-2.1") || "(no name)";
  const company = v("f-2.3") || "(no company)";
  const skillCount = document.querySelectorAll(".skill-name").length;
  const tones = selectedTones.join(", ") || "(none selected)";

  summary.innerHTML = `
    <div><strong>Agent:</strong> ${title}</div>
    <div><strong>Works for:</strong> ${name} at ${company}</div>
    <div><strong>Skills:</strong> ${skillCount}</div>
    <div><strong>Tone:</strong> ${tones}</div>
    <div><strong>Autonomy:</strong> ${selectedDecision || "(not set)"}</div>
  `;
}

// ─── Convert (generate agent) ───────────────────────
async function runConvert() {
  await doSave();

  const form = document.getElementById("generate-form");
  const loading = document.getElementById("generate-loading");
  const status = document.getElementById("generate-status");
  const btn = document.getElementById("generate-btn");

  form.style.display = "none";
  loading.style.display = "";
  status.textContent = "Sending to LLM. This takes 30-90 seconds.";

  try {
    const outputDir = document.getElementById("output-dir")?.value.trim() || "";
    const res = await fetch("/api/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outputDir: outputDir || undefined })
    });

    const data = await res.json();

    if (!res.ok) {
      status.textContent = `Error: ${data.error}`;
      status.style.color = "var(--danger)";
      setTimeout(() => {
        form.style.display = "";
        loading.style.display = "none";
        status.style.color = "";
      }, 3000);
      return;
    }

    // Success -- go to done screen
    document.getElementById("done-path").textContent = data.outputDir;
    document.getElementById("done-files").innerHTML = (data.files || [])
      .map(f => `<div>${f}</div>`).join("");

    goStep(8);

  } catch (err) {
    status.textContent = `Error: ${err.message}`;
    status.style.color = "var(--danger)";
    setTimeout(() => {
      form.style.display = "";
      loading.style.display = "none";
      status.style.color = "";
    }, 3000);
  }
}
