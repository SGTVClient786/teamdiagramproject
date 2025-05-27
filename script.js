// --- PASSWORD ---
const CORRECT_PASSWORD = "GreenGardeners1"; // Your password

// --- TEAM DATA (Keep this at the top, outside any function) ---
let teamMembers = [
    {
        id: 1,
        name: "Alice Wonderland",
        availability: "Available",
        workload: 1,
        skills: [
            { name: "JavaScript", proficiency: "Expert" },
            { name: "React", proficiency: "Intermediate" },
            { name: "CSS", proficiency: "Expert" }
        ],
        currentTask: "Developing the new dashboard feature.",
        notes: "Prefers front-end tasks. Attending a Vue.js workshop next week.",
        lastUpdated: "2025-05-26"
    },
    {
        id: 2,
        name: "Bob The Builder",
        availability: "Fully Occupied",
        workload: 3,
        skills: [
            { name: "Node.js", proficiency: "Expert" },
            { name: "Database Management", proficiency: "Expert" },
            { name: "JavaScript", proficiency: "Intermediate" }
        ],
        currentTask: "Optimizing database queries and setting up deployment pipelines.",
        notes: "Strong backend capabilities.",
        lastUpdated: "2025-05-27"
    },
    {
        id: 3,
        name: "Charlie Brown",
        availability: "Available",
        workload: 0,
        skills: [
            { name: "HTML", proficiency: "Beginner" },
            { name: "CSS", proficiency: "Intermediate" }
        ],
        currentTask: "",
        notes: "Eager to learn and assist with UI tasks.",
        lastUpdated: "2025-05-20"
    },
    {
        id: 4,
        name: "Diana Prince",
        availability: "On Leave",
        workload: 0,
        skills: [
            { name: "Project Management", proficiency: "Expert" },
            { name: "JavaScript", proficiency: "Beginner" }
        ],
        currentTask: "",
        notes: "Back next month.",
        lastUpdated: "2025-05-15"
    }
];

// --- DATA PERSISTENCE FUNCTIONS ---
function saveData() {
    localStorage.setItem('teamMembersData', JSON.stringify(teamMembers));
}

function loadData() {
    const data = localStorage.getItem('teamMembersData');
    if (data) {
        teamMembers = JSON.parse(data);
    }
}

let currentView = 'overview'; // Default view

// --- MAIN APPLICATION INITIALIZATION (Called after password success) ---
function initializeApp() {
    // --- GET HTML ELEMENTS FOR THE APP ---
    const appContent = document.getElementById('appContent');
    const teamDiagramContainer = document.getElementById('teamDiagramContainer');
    const modal = document.getElementById('memberModal');
    const quickAddModal = document.getElementById('quickAddModal');
    const closeBtn = document.querySelector('#memberModal .close-btn');
    const closeBtnAdd = document.querySelector('#quickAddModal .close-btn-add');
    const memberEditForm = document.getElementById('memberEditForm');
    const skillSearchInput = document.getElementById('skillSearch');
    const quickAddMemberBtn = document.getElementById('quickAddMemberBtn');
    const quickAddForm = document.getElementById('quickAddForm');
    const deleteMemberBtn = document.getElementById('deleteMemberBtn'); // Get the delete button

    if (appContent) {
        appContent.style.display = 'block';
    } else {
        console.error("Fatal Error: appContent element not found.");
        return;
    }

    setActiveViewButton();
    loadData();
    renderCurrentView();

    // --- VIEW MODE BUTTONS ---
    document.querySelectorAll('.view-mode-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const newView = e.target.dataset.view;
            if (newView === currentView) return;
            currentView = newView;
            setActiveViewButton(e.target);
            renderCurrentView();
        });
    });

    function setActiveViewButton(activeButton) {
        document.querySelectorAll('.view-mode-btn').forEach(btn => btn.classList.remove('active'));
        if (activeButton) {
            activeButton.classList.add('active');
        } else {
            const overviewButton = document.querySelector('.view-mode-btn[data-view="overview"]');
            if (overviewButton) overviewButton.classList.add('active');
        }
    }

    // --- MAIN RENDER CONTROLLER ---
    function renderCurrentView() {
        if (!teamDiagramContainer) {
            console.error("Error: teamDiagramContainer element not found.");
            return;
        }
        teamDiagramContainer.innerHTML = '';
        teamDiagramContainer.className = 'team-diagram-container';
        if (skillSearchInput) skillSearchInput.value = '';

        switch (currentView) {
            case 'overview':
                teamDiagramContainer.classList.add('overview-view');
                renderOverviewView(teamMembers);
                break;
            case 'task':
                teamDiagramContainer.classList.add('task-view');
                renderTaskView(teamMembers);
                break;
            case 'skills':
                teamDiagramContainer.classList.add('skills-matrix-view');
                renderSkillsMatrixView(teamMembers);
                break;
            default:
                teamDiagramContainer.classList.add('overview-view');
                renderOverviewView(teamMembers);
        }
    }

    // --- REUSABLE MEMBER CARD CREATION ---
    function createMemberCardElement(member) {
        const card = document.createElement('div');
        card.classList.add('team-member-card');
        card.dataset.id = member.id;
        const availabilityClass = `status-${member.availability.toLowerCase().replace(/\s+/g, '-')}`;
        card.classList.add(availabilityClass);
        if (!member.currentTask && member.availability === "Available") {
            card.classList.add('status-unassigned');
        }
        card.innerHTML = `
            <h3>${member.name}</h3>
            <p><strong>Status:</strong> ${member.availability}</p>
            <p class="workload-indicator"><strong>Workload:</strong> ${member.workload} task(s)</p>
            <p><strong>Current Task:</strong> ${member.currentTask || 'N/A'}</p>
            <p><strong>Skills:</strong> ${member.skills.map(s => `${s.name} (${s.proficiency.charAt(0)})`).join(', ') || 'N/A'}</p>
        `;
        card.addEventListener('click', () => openMemberModal(member.id));
        return card;
    }

    // --- OVERVIEW VIEW RENDER ---
    function renderOverviewView(membersToRender) {
        if (!teamDiagramContainer) return;
        membersToRender.forEach(member => teamDiagramContainer.appendChild(createMemberCardElement(member)));
    }

    // --- TASK VIEW RENDER ---
    function renderTaskView(members) {
        if (!teamDiagramContainer) return;
        const availableMembers = members.filter(m => (!m.currentTask || m.currentTask.trim() === '') && m.availability === 'Available');
        const workingMembers = members.filter(m => m.currentTask && m.currentTask.trim() !== '' && (m.availability === 'Fully Occupied' || m.availability === 'Partially Available'));
        const otherMembers = members.filter(m => !availableMembers.includes(m) && !workingMembers.includes(m));
        const createSection = (title, memberList) => {
            if (memberList.length > 0) {
                const header = document.createElement('h2');
                header.textContent = title;
                teamDiagramContainer.appendChild(header);
                const groupContainer = document.createElement('div');
                groupContainer.className = 'member-group';
                memberList.forEach(member => groupContainer.appendChild(createMemberCardElement(member)));
                teamDiagramContainer.appendChild(groupContainer);
            }
        };
        createSection('Available for Tasks', availableMembers);
        createSection('Currently Working', workingMembers);
        createSection('Other Statuses (e.g., On Leave)', otherMembers);
    }

    // --- SKILLS MATRIX VIEW RENDER ---
    function renderSkillsMatrixView(members) {
        if (!teamDiagramContainer) return;
        const allSkills = new Set();
        members.forEach(member => member.skills.forEach(skill => allSkills.add(skill.name)));
        const uniqueSkills = Array.from(allSkills).sort();
        const table = document.createElement('table');
        table.className = 'skills-matrix-table';
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        const thMember = document.createElement('th');
        thMember.textContent = 'Team Member';
        headerRow.appendChild(thMember);
        uniqueSkills.forEach(skillName => {
            const th = document.createElement('th');
            th.textContent = skillName;
            headerRow.appendChild(th);
        });
        const tbody = table.createTBody();
        members.forEach(member => {
            const tr = tbody.insertRow();
            const tdMember = tr.insertCell();
            const memberNameSpan = document.createElement('span');
            memberNameSpan.textContent = member.name;
            memberNameSpan.style.cursor = 'pointer';
            memberNameSpan.style.color = '#3498db';
            memberNameSpan.title = `Click to view/edit ${member.name}`;
            memberNameSpan.onclick = () => openMemberModal(member.id);
            tdMember.appendChild(memberNameSpan);
            uniqueSkills.forEach(skillName => {
                const tdSkill = tr.insertCell();
                const memberSkill = member.skills.find(s => s.name === skillName);
                tdSkill.textContent = memberSkill ? memberSkill.proficiency.charAt(0) : '-';
                if (memberSkill) {
                    tdSkill.classList.add(`proficiency-${memberSkill.proficiency.toLowerCase().replace(/\s+/g, '-')}`);
                    tdSkill.title = memberSkill.proficiency;
                }
            });
        });
        teamDiagramContainer.appendChild(table);
    }

    // --- MODAL LOGIC ---
    function openMemberModal(memberId) {
        if (!modal) return;
        const member = teamMembers.find(m => m.id === memberId);
        if (!member) return;
        const modalMemberId = document.getElementById('memberId');
        const modalNameEl = document.getElementById('modalName');
        const modalAvailabilityEl = document.getElementById('modalAvailability');
        const modalCurrentTaskEl = document.getElementById('modalCurrentTask');
        const modalSkillsEl = document.getElementById('modalSkills');
        const modalNotesEl = document.getElementById('modalNotes');
        const modalLastUpdatedEl = document.getElementById('modalLastUpdated');
        if (modalMemberId) modalMemberId.value = member.id;
        if (modalNameEl) modalNameEl.textContent = member.name;
        if (modalAvailabilityEl) modalAvailabilityEl.value = member.availability;
        if (modalCurrentTaskEl) modalCurrentTaskEl.value = member.currentTask;
        if (modalSkillsEl) modalSkillsEl.value = member.skills.map(s => `${s.name}:${s.proficiency}`).join(';');
        if (modalNotesEl) modalNotesEl.value = member.notes;
        if (modalLastUpdatedEl) modalLastUpdatedEl.textContent = member.lastUpdated;
        modal.style.display = 'block';
    }

    if (closeBtn) closeBtn.onclick = () => { if (modal) modal.style.display = 'none'; };
    if (closeBtnAdd) closeBtnAdd.onclick = () => { if (quickAddModal) quickAddModal.style.display = 'none'; };

    window.onclick = (event) => {
        if (modal && event.target == modal) modal.style.display = 'none';
        if (quickAddModal && event.target == quickAddModal) quickAddModal.style.display = 'none';
    };

    // --- EDIT FORM SUBMISSION ---
    if (memberEditForm) {
        memberEditForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const memberIdInput = document.getElementById('memberId');
            if (!memberIdInput) return;
            const memberId = parseInt(memberIdInput.value);
            const memberIndex = teamMembers.findIndex(m => m.id === memberId);
            if (memberIndex === -1) return;
            const availabilityInput = document.getElementById('modalAvailability');
            const currentTaskInput = document.getElementById('modalCurrentTask');
            const skillsInput = document.getElementById('modalSkills');
            const notesInput = document.getElementById('modalNotes');
            if (availabilityInput) teamMembers[memberIndex].availability = availabilityInput.value;
            if (currentTaskInput) teamMembers[memberIndex].currentTask = currentTaskInput.value;
            if (skillsInput) {
                const skillsString = skillsInput.value;
                teamMembers[memberIndex].skills = skillsString.split(';').filter(s => s.trim() !== '').map(s => {
                    const parts = s.split(':');
                    return parts.length === 2 ? { name: parts[0].trim(), proficiency: parts[1].trim() } : null;
                }).filter(s => s && s.name && s.proficiency);
            }
            if (notesInput) teamMembers[memberIndex].notes = notesInput.value;
            teamMembers[memberIndex].lastUpdated = new Date().toISOString().split('T')[0];
            teamMembers[memberIndex].workload = (teamMembers[memberIndex].currentTask && teamMembers[memberIndex].currentTask.trim() !== '') ? 1 : 0;
            saveData();
            renderCurrentView();
            if (modal) modal.style.display = 'none';
            logChange(`${teamMembers[memberIndex].name}'s profile updated.`);
        });
    }

    // --- DELETE MEMBER FUNCTIONALITY ---
    if (deleteMemberBtn) {
        deleteMemberBtn.addEventListener('click', () => {
            const memberIdInput = document.getElementById('memberId');
            if (!memberIdInput || !memberIdInput.value) return;

            const memberIdToDelete = parseInt(memberIdInput.value);
            const memberToDelete = teamMembers.find(m => m.id === memberIdToDelete);

            if (!memberToDelete) return;

            if (confirm(`Are you sure you want to delete ${memberToDelete.name}? This action cannot be undone.`)) {
                teamMembers = teamMembers.filter(member => member.id !== memberIdToDelete);
                saveData();
                renderCurrentView();
                if (modal) modal.style.display = 'none';
                logChange(`${memberToDelete.name} deleted from the team.`);
            }
        });
    }

    // --- SKILL SEARCH/FILTER ---
    if (skillSearchInput) {
        skillSearchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase().trim();
            if (currentView === 'overview' || currentView === 'task') {
                let membersToFilter = [...teamMembers];
                if (searchTerm === '') {
                    renderCurrentView();
                    return;
                }
                const filteredMembers = membersToFilter.filter(member =>
                    member.name.toLowerCase().includes(searchTerm) ||
                    member.skills.some(skill => skill.name.toLowerCase().includes(searchTerm))
                );
                if (!teamDiagramContainer) return;
                teamDiagramContainer.innerHTML = '';
                if (currentView === 'overview') {
                    teamDiagramContainer.classList.add('overview-view');
                    renderOverviewView(filteredMembers);
                } else if (currentView === 'task') {
                    teamDiagramContainer.classList.add('task-view');
                    renderTaskView(filteredMembers);
                }
            }
        });
    }

    // --- QUICK ADD MEMBER ---
    if (quickAddMemberBtn) quickAddMemberBtn.onclick = () => { if (quickAddModal) quickAddModal.style.display = 'block'; };
    if (quickAddForm) {
        quickAddForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newNameInput = document.getElementById('newMemberName');
            if (!newNameInput) return;
            const newName = newNameInput.value;
            if (!newName.trim()) {
                alert("Please enter a name for the new member.");
                return;
            }
            const newMember = {
                id: Date.now(), name: newName.trim(), availability: "Available", workload: 0,
                skills: [], currentTask: "", notes: "",
                lastUpdated: new Date().toISOString().split('T')[0]
            };
            teamMembers.push(newMember);
            saveData();
            renderCurrentView();
            if (quickAddModal) quickAddModal.style.display = 'none';
            quickAddForm.reset();
            logChange(`${newName.trim()} added to the team.`);
        });
    }

    // --- CHANGE LOG ---
    function logChange(message) {
        const logEntry = `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] ${message}`;
        console.log(logEntry);
    }
} // END OF initializeApp()

// --- PASSWORD CHECK LOGIC (Runs on DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    const passwordOverlay = document.getElementById('passwordOverlay');
    const passwordInput = document.getElementById('passwordInput');
    const passwordSubmitBtn = document.getElementById('passwordSubmitBtn');
    const passwordError = document.getElementById('passwordError');

    if (!passwordOverlay || !passwordInput || !passwordSubmitBtn || !passwordError) {
        console.error("Password prompt elements not found. Cannot initialize password protection.");
        return;
    }

    passwordInput.focus();

    const attemptLogin = () => {
        if (passwordInput.value === CORRECT_PASSWORD) {
            if (passwordOverlay) passwordOverlay.style.display = 'none';
            initializeApp();
        } else {
            if (passwordError) passwordError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    };

    passwordSubmitBtn.addEventListener('click', attemptLogin);
    passwordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            attemptLogin();
        }
    });
});