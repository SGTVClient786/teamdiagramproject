document.addEventListener('DOMContentLoaded', () => {
    // Load initial data (e.g., from localStorage or use the example)
    loadData();
    renderTeamMembers(teamMembers); // Initial render

    const teamDiagramContainer = document.getElementById('teamDiagramContainer');
    const modal = document.getElementById('memberModal');
    const quickAddModal = document.getElementById('quickAddModal');
    const closeBtn = document.querySelector('.close-btn');
    const closeBtnAdd = document.querySelector('.close-btn-add');
    const memberEditForm = document.getElementById('memberEditForm');
    const skillSearchInput = document.getElementById('skillSearch');
    const quickAddMemberBtn = document.getElementById('quickAddMemberBtn');
    const quickAddForm = document.getElementById('quickAddForm');
    const changeLogList = document.getElementById('logList'); // Conceptual

    // --- Render Team Members ---
    function renderTeamMembers(membersToRender) {
        teamDiagramContainer.innerHTML = ''; // Clear existing members
        membersToRender.forEach(member => {
            const card = document.createElement('div');
            card.classList.add('team-member-card');
            card.dataset.id = member.id;

            // Apply availability status class
            const availabilityClass = `status-${member.availability.toLowerCase().replace(/\s+/g, '-')}`;
            card.classList.add(availabilityClass);

            // Highlight if unassigned
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
            teamDiagramContainer.appendChild(card);
        });
    }

    // --- Modal Logic ---
    function openMemberModal(memberId) {
        const member = teamMembers.find(m => m.id === memberId);
        if (!member) return;

        document.getElementById('memberId').value = member.id;
        document.getElementById('modalName').textContent = member.name;
        document.getElementById('modalAvailability').value = member.availability;
        document.getElementById('modalCurrentTask').value = member.currentTask;
        // Simple skill string - for robust editing, this needs a better UI
        document.getElementById('modalSkills').value = member.skills.map(s => `${s.name}:${s.proficiency}`).join(';');
        document.getElementById('modalNotes').value = member.notes;
        document.getElementById('modalLastUpdated').textContent = member.lastUpdated;
        modal.style.display = 'block';
    }

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == quickAddModal) {
            quickAddModal.style.display = 'none';
        }
    };

    // --- Edit Form Submission ---
    memberEditForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const memberId = parseInt(document.getElementById('memberId').value);
        const memberIndex = teamMembers.findIndex(m => m.id === memberId);

        if (memberIndex === -1) return;

        teamMembers[memberIndex].availability = document.getElementById('modalAvailability').value;
        teamMembers[memberIndex].currentTask = document.getElementById('modalCurrentTask').value;
        // Basic skill parsing (needs improvement for real application)
        const skillsString = document.getElementById('modalSkills').value;
        teamMembers[memberIndex].skills = skillsString.split(';')
            .map(s => {
                const parts = s.split(':');
                return parts.length === 2 ? { name: parts[0].trim(), proficiency: parts[1].trim() } : null;
            })
            .filter(s => s && s.name && s.proficiency);

        teamMembers[memberIndex].notes = document.getElementById('modalNotes').value;
        teamMembers[memberIndex].lastUpdated = new Date().toISOString().split('T')[0]; // Update timestamp
        
        // Update workload (conceptual - might depend on how tasks are managed)
        teamMembers[memberIndex].workload = teamMembers[memberIndex].currentTask ? 1 : 0; // Simplified

        saveData(); // Persist changes
        renderTeamMembers(teamMembers);
        modal.style.display = 'none';
        logChange(`${teamMembers[memberIndex].name}'s profile updated.`);
    });

    // --- Skill Search/Filter ---
    skillSearchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredMembers = teamMembers.filter(member =>
            member.skills.some(skill => skill.name.toLowerCase().includes(searchTerm))
        );
        renderTeamMembers(filteredMembers);
    });

    // --- Quick Add Member ---
    quickAddMemberBtn.onclick = () => quickAddModal.style.display = 'block';
    closeBtnAdd.onclick = () => quickAddModal.style.display = 'none';

    quickAddForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newName = document.getElementById('newMemberName').value;
        if (!newName) return;

        const newMember = {
            id: Date.now(), // Simple unique ID
            name: newName,
            availability: "Available",
            workload: 0,
            skills: [],
            currentTask: "",
            notes: "",
            lastUpdated: new Date().toISOString().split('T')[0]
        };
        teamMembers.push(newMember);
        saveData();
        renderTeamMembers(teamMembers);
        quickAddModal.style.display = 'none';
        quickAddForm.reset();
        logChange(`${newName} added to the team.`);
    });

    // --- Change Log (Conceptual) ---
    function logChange(message) {
        const listItem = document.createElement('li');
        listItem.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        // changeLogList.prepend(listItem); // Add to top
        // if(changeLogList.children.length > 10) changeLogList.lastChild.remove(); // Keep log short
        console.log(message); // For now, just log to console
    }

    // --- View Modes (Conceptual - would require more logic to switch displays) ---
    document.querySelectorAll('.view-mode-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            alert(`Switching to ${view} view (implementation needed).`);
            // Here you would call different rendering functions or adjust the current one
            // e.g., if (view === 'skills') renderSkillsMatrix();
        });
    });
    
    // --- Bulk Editing (Conceptual) ---
    // This would involve:
    // 1. UI for selecting multiple members (e.g., checkboxes on cards).
    // 2. A "Bulk Edit" button that opens a modal with common fields.
    // 3. Applying changes to all selected members.
    // This is significantly more complex and beyond a quick snippet.

});