document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Send email when form is submitted
  document.querySelector('form').onsubmit = function () {
    fetch('/emails', {
      method : 'POST',
      body : JSON.stringify({
        recipients : document.querySelector('#compose-recipients').value,
        subject : document.querySelector('#compose-subject').value, 
        body : document.querySelector('#compose-body').value
        }) 
    })
    .then(response => response.json())
    .then(result => {
      console.log(result);
    });
    //load user's sent mailbox
    load_mailbox('sent');

    return false;
     
  };
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
      //hide the new mail div
  document.querySelector('#mail').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Create a ul to contain the emails as li items
  var ul = document.createElement('ul');
  ul.setAttribute('class','list-group');
  document.querySelector('#emails-view').append(ul);

  // Request for mailbox content (fetched)
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //print emails to console
    for (const email of emails){
      const sender = email.sender;
      const subject = email.subject;
      const timestamp = email.timestamp;
      const recipient = email.recipients;
      const body = email.body;
      console.log(`sender:${sender}, subject:${subject}, time :${timestamp}`);
      //create div element
      var element = document.createElement('li');
      element.setAttribute('class','list-group-item');
      if (mailbox =='inbox'){
        element.innerHTML = ` ${sender} : ${subject} <span style="float:right;">${timestamp}</span> `

      } else{
        element.innerHTML = ` ${recipient} : ${subject} <span style="float:right;">${timestamp}</span> `
      }
      
      element.addEventListener('click', function(){
        console.log(`${email.body}`);
        //Fetch the email info:
        fetch(`/emails/${email.id}`)
        .then(response => response.json())
        .then(email =>{
          //Old approach
          //var element2 = document.querySelector('#mail');
          //element2.innerHTML = `<p><strong>From: </strong>${sender}</p><p><strong>To: </strong>${recipient}</p>
          //<p><strong>Subject: </strong>${subject}</p><p><strong>Timestamp: </strong>${timestamp}</p>
          //<p><strong>Body:</strong></p><p> ${body}</p>`;
          // Hide the button when mailbox is sent
          document.querySelector("#archive-button").style.display = 'block';
          if (mailbox == "sent"){
            document.querySelector("#archive-button").style.display = 'none';
          }
          //New approach
          document.querySelector("#from").innerHTML = `<strong>From: </strong>${sender}`;
          document.querySelector("#to").innerHTML =`<strong>To: </strong>${recipient}`;
          document.querySelector("#subject").innerHTML = `<strong>Subject: </strong>${subject}`;
          document.querySelector("#timestamp").innerHTML = `<strong>Timestamp: </strong>${timestamp}`;
          document.querySelector("#body").innerHTML = `<strong>Body:</strong></p><p> ${body}`;
          // hide the other views
          document.querySelector('#emails-view').style.display = 'none';
          document.querySelector('#compose-view').style.display = 'none';
          document.querySelector('#mail').style.display = 'block';

          // Check and change button innerHTML if archive is true
          if (email.archived == true){
            document.querySelector("#archive-button").innerHTML = "Unarchive";
          }

          //Add event on click to archive-button
          var archive_button = document.querySelector("#archive-button");
          archive_button.addEventListener('click', function(){
            if (archive_button.innerHTML == "Archive"){
              fetch(`/emails/${email.id}`,{
                method : 'PUT',
                body : JSON.stringify({
                  archived : true
                })
              })
              load_mailbox('inbox');
            } else if (archive_button.innerHTML == "Unarchive") {
              fetch(`/emails/${email.id}`,{
                method : 'PUT',
                body : JSON.stringify({
                  archived : false
                })
              })
              load_mailbox('inbox');
            }
            //load_mailbox('inbox');
          });

          // Add event to reply
          document.querySelector("#reply").addEventListener('click', function(){
            compose_email();
            document.querySelector("#compose-recipients").value = `${sender}`;
            if (subject.startsWith("Re:") == true){
              document.querySelector("#compose-subject").value = `${subject}`;
            } else {
              document.querySelector("#compose-subject").value = `Re: ${subject}`;
            }
            
            document.querySelector("#compose-body").value = `On ${timestamp}, ${sender} wrote: ${body}`;
          })

        });

        // Mark email as read
        fetch(`/emails/${email.id}`,{
          method : 'PUT',
          body : JSON.stringify({
            read : true
          })
        })
        console.log(`${email.read}`);
        //.then(response => response.json())
        //.then(results =>{
          //console.log(results);
        //});
  
      });
      
      //---------------------------------------------------------------------
      document.querySelector('.list-group').append(element);
      element.style.border = "inset";
      element.style.borderRadius = "20px";

      //Check whether read or not to change backgroung to white or gray
      if (email.read == true){
        element.style.background = "gray";
      }else if (email.read == false) {
        element.style.backgroung = "white";
      }
    
    }
  });

}

