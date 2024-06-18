
document.addEventListener('DOMContentLoaded', function () {
    fetchContactsFromServer();
    setupNameValidation();
    updateGroupFilterOptions();
    fetchGroupsFromServer();
    
    setupEditForm();
});

document.getElementById('profilePicture').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const preview = document.getElementById('profilePicturePreview');
            preview.src = e.target.result;
            preview.classList.remove('d-none');
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('contactForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const gender = document.getElementById('gender').value;
    const group = document.getElementById('group').value;
    const profilePicture = document.getElementById('profilePicture').files[0];

    const reader = new FileReader();
    reader.onload = function (e) {
        const profilePictureURL = e.target.result;
        const contact = {
            name,
            phone,
            email,
            gender,
            group,
            profilePicture: profilePicture // Assuming profilePicture is the File object
        };
        saveContactToServer(contact);
    }

    
 reader.readAsDataURL(profilePicture);

    this.reset();
    document.getElementById('profilePicturePreview').classList.add('d-none');
    document.querySelector('.custom-file-label').textContent = 'Choose file';
});

document.getElementById('groupFilter').addEventListener('change', function () {
    filterContactsByGroup(this.value);
});

function filterContactsByGroup(group) {
    const table = document.getElementById('contactsTable');
    table.innerHTML = '';
    fetchContactsByGroup(group);
}

let deleteContactCallback;

document.getElementById('confirmDelete').addEventListener('click', function () {
    if (deleteContactCallback) {
        deleteContactCallback();
    }
    const deleteModal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
    deleteModal.hide();
});


function fetchContactsFromServer() {
    // Clear local storage to ensure only server-fetched contacts are displayed
    localStorage.removeItem('contacts');

    fetch('http://localhost:3000/api/contacts')
        .then(response => response.json())
        .then(contacts => {
            contacts.forEach(contact => {
                addContactToTable(contact); // This adds contacts to the table
            });
        })
        .catch(error => {
            console.error('Error fetching contacts:', error);
        });
}

function fetchContactsByGroup(group) {
    // Clear local storage to ensure only server-fetched contacts are displayed
    fetch(`http://localhost:3000/api/contacts/group/${group}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error('Expected an array of contacts');
            }
            data.forEach(contact => {
                addContactToTable(contact); // This adds contacts to the table
            });
        })
        .catch(error => {
            console.error('Error fetching group:', error);
            alert('Error fetching contacts for the group');
        });
}

function fetchGroupsFromServer() {
    fetch('http://localhost:3000/api/groups')
        .then(response => response.json())
        .then(groups => {
            const groupFilter = document.getElementById('groupFilter');
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.group_name;
                option.textContent = group.group_name;
                groupFilter.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching groups:', error);
        });
}




function setupNameValidation() {
    document.getElementById('name').addEventListener('input', function () {
        this.value = this.value.replace(/[^a-zA-Z\s-']/g, '');
        this.value = this.value.slice(0, 100);
    });
}

function validateInputs(name, phone, email, streetAddress, city, stateProvince, postalCode, country) {
    const namePattern = /^[A-Za-z\s]{1,100}$/;
    const phonePattern = /^\+?[\d\s\-\(\)]{7,15}$/;
    const emailPattern = /^[\w\.-]+@[\w\.-]+\.\w{2,}$/;
    

    if (!namePattern.test(name)) {
        alert('Please enter a valid name (alphabetic characters, spaces, hyphens, apostrophes, max 100 characters).');
        return false;
    }

    if (!phonePattern.test(phone)) {
        alert('Please enter a valid phone number (numeric characters, spaces, hyphens, parentheses, 7-15 characters).');
        return false;
    }

    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    

    

   
    return true;
}

function addContactToTable(contact) {
    const table = document.getElementById('contactsTable');
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';

    const tile = document.createElement('div');
    tile.className = 'contact-tile shadow-sm';
    tile.setAttribute('data-group', contact.group_name);

    const img = document.createElement('img');
    img.src = contact.profile_picture_url;
    img.alt = contact.name;

    const nameDiv = document.createElement('div');
    nameDiv.className = 'contact-name';
    nameDiv.textContent = contact.name;

    const phoneDiv = document.createElement('div');
    phoneDiv.className = 'contact-phone';
    phoneDiv.textContent = `Phone: ${contact.phone}`;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'contact-details';

    const genderSpan = document.createElement('div');
    genderSpan.className = 'contact-gender';
    genderSpan.textContent = `Gender: ${contact.gender}`;

    const emailSpan = document.createElement('div');
    emailSpan.className = 'contact-email';
    emailSpan.textContent = `Email: ${contact.email}`;

    const groupSpan = document.createElement('div');
    groupSpan.className = 'contact-group';
    groupSpan.textContent = `Group: ${contact.group_name}`;

    detailsDiv.appendChild(genderSpan);
    detailsDiv.appendChild(emailSpan);
    detailsDiv.appendChild(groupSpan);

    const viewIcon = document.createElement('span');
    viewIcon.className = 'material-icons view-icon';
    viewIcon.textContent = 'visibility';
    viewIcon.style.cursor = 'pointer';
    viewIcon.addEventListener('click', function () {
        detailsDiv.classList.toggle('show');
    });

    const editIcon = document.createElement('span');
    editIcon.className = 'material-icons edit-icon';
    editIcon.textContent = 'edit';
    editIcon.style.cursor = 'pointer';
    editIcon.addEventListener('click', function () {
        populateEditForm(contact);
        const editModal = new bootstrap.Modal(document.getElementById('editModal'));
        editModal.show();
    });

    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'material-icons delete-icon';
    deleteIcon.textContent = 'delete';
    deleteIcon.style.cursor = 'pointer';
    deleteIcon.addEventListener('click', function () {
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteContactCallback = function () {
            col.remove(); 

           
            const phoneNumber = contact.phone;

            fetch(`http://localhost:3000/api/contacts/${phoneNumber}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                
                        alert('Contact deleted successfully');
                    } else {
                       
                        throw new Error('Failed to delete contact');
                    }
                });
        };
        deleteModal.show();
    });


    tile.appendChild(img);
    tile.appendChild(nameDiv);
    tile.appendChild(phoneDiv);
    tile.appendChild(detailsDiv);
    tile.appendChild(viewIcon);
    tile.appendChild(editIcon);
    tile.appendChild(deleteIcon);

    col.appendChild(tile);
    table.appendChild(col);
}



function populateEditForm(contact) {
    document.getElementById('editContactId').value = contact.id;
    document.getElementById('editName').value = contact.name;
    document.getElementById('editPhone').value = contact.phone;
    document.getElementById('editEmail').value = contact.email;
    document.getElementById('editGender').value = contact.gender;
    document.getElementById('editGroup').value = contact.group_name;


}

function setupEditForm() {
    document.getElementById('editContactForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const id = document.getElementById('editContactId').value;
        const name = document.getElementById('editName').value;
        const phone = document.getElementById('editPhone').value;
        const email = document.getElementById('editEmail').value;
        const gender = document.getElementById('editGender').value;
        const group = document.getElementById('editGroup').value;
        



        const updatedContact = {
            name,
            phone,
            email,
            gender,
            group_name: group
        };

        fetch(`http://localhost:3000/api/contacts/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedContact)
        })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Contact updated successfully') {
                    alert('Contact updated successfully');
                    location.reload(); // Simple way to refresh the page and show updated contact
                } else {
                    alert('Error updating contact');
                }
            })
            .catch(error => {
                console.error('Error updating contact:', error);
                alert('Error updating contact');
            });
    });
}










function enableEditMode(nameDiv, phoneDiv, genderSpan, emailSpan, groupSpan,  editIcon, saveIcon, img, fileInput) {
    editIcon.classList.add('d-none');
    saveIcon.classList.remove('d-none');
    nameDiv.contentEditable = true;
    phoneDiv.contentEditable = true;
    genderSpan.contentEditable = true;
    emailSpan.contentEditable = true;
    groupSpan.contentEditable = true;
    
    fileInput.classList.remove('d-none');
}

function saveContactChanges(nameDiv, phoneDiv, genderSpan, emailSpan, groupSpan, saveIcon, editIcon, img, fileInput) {
    editIcon.classList.remove('d-none');
    saveIcon.classList.add('d-none');
    nameDiv.contentEditable = false;
    phoneDiv.contentEditable = false;
    genderSpan.contentEditable = false;
    emailSpan.contentEditable = false;
    groupSpan.contentEditable = false;
   
    fileInput.classList.add('d-none');

    const updatedContact = {
        name: nameDiv.textContent,
        phone: phoneDiv.textContent.replace('Phone: ', ''),
        gender: genderSpan.textContent.replace('Gender: ', ''),
        email: emailSpan.textContent.replace('Email: ', ''),
        group: groupSpan.textContent.replace('Group: ', ''),

        profilePicture: fileInput.files[0] ? fileInput.files[0] : img.src
    };

    updateContactInStorage(updatedContact);
    saveContactToServer(updatedContact);
}

function saveContactToStorage(contact) {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    contacts.push(contact);
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

function loadContactsFromStorage() {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    contacts.forEach(contact => {
        addContactToTable(contact);
    });
}

function updateContactInStorage(updatedContact) {
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    const contactIndex = contacts.findIndex(contact => contact.phone === updatedContact.phone);
    if (contactIndex !== -1) {
        contacts[contactIndex] = updatedContact;
        localStorage.setItem('contacts', JSON.stringify(contacts));
    }
}

function saveContactToServer(contact) {
    const formData = new FormData();
    formData.append('name', contact.name);
    formData.append('phone', contact.phone);
    formData.append('email', contact.email);
    formData.append('gender', contact.gender);
    formData.append('group', contact.group);
    formData.append('profilePicture', contact.profilePicture);

    fetch('http://localhost:3000/api/contacts', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error && data.error.sqlMessage && data.error.sqlMessage.includes('Duplicate entry')) {
                
                alert('Phone number already exists for another contact');
            } else if (data.error) {
              
                alert(data.error);
            } else {
                
                alert('Contact added successfully');
                location.reload(); // Refresh the page or update contact list
            }
        })
        .catch(error => {
            console.error('Error saving contact:', error);
            alert('Error saving contact: Phone number already exists for another contact');
        });
}



function updateGroupFilterOptions() {
    const groupFilter = document.getElementById('groupFilter');
    const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
    const groups = Array.from(new Set(contacts.map(contact => contact.group)));
    groupFilter.innerHTML = '<option value="">All Groups</option>';
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group;
        groupFilter.appendChild(option);
    });
}



document.querySelector('.custom-file-input').addEventListener('change', function () {
    let fileName = this.value.split('\\').pop();
    this.nextElementSibling.classList.add('selected');
    this.nextElementSibling.innerHTML = fileName;
});


