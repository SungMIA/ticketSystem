import { useState } from "react";
import { auth, firestore, db } from "./firebase";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  arrayUnion,
} from "firebase/firestore";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { keyboard } from "@testing-library/user-event/dist/keyboard";

export default function Main() {
  let [myTickets, setMyTickets] = useState([]);
  let [myName, setMyName] = useState("");

  async function getAllMyTickets(name) {
    let tickets = collection(db, "tickets");
    let q = query(
      tickets,
      where("Name", "==", name),
      orderBy("timestamp", "desc")
    );
    if (name == "Admin") {
      q = query(tickets, orderBy("timestamp", "desc"));
    }
    let myTickets = [];

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      myTickets.push(doc.data());
      //console.log(doc.id, " => ", doc.data());
    });
    console.log(myTickets);
    setMyTickets(myTickets);
  }

  async function getAllResponses(name) {
    let tickets = collection(db, "tickets", "responses");

    let q = query(
      tickets,
      where("ticketName", "==", name),
      orderBy("timestamp", "desc")
    );
    let myResponses = [];

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      myResponses.push(doc.data());
      //console.log(doc.id, " => ", doc.data());
    });
    console.log(myResponses);
    //setMyTickets(myResponses);
  }
  //add a "action" to the form action = {}
  async function getLatestTicket() {
    let tickets = collection(db, "tickets");

    let q = query(tickets, orderBy("timestamp", "desc"), limit(1));
    let ticketName = "";

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      ticketName = doc.id;
    });
    if (ticketName == "") {
      ticketName = "ticket_0";
    }
    return ticketName;
  }

  async function handleSubmit(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();

    let name = document.getElementById("firstNameInput").value;
    let email = document.getElementById("emailInput").value;
    let description = document.getElementById("description").value;

    let d = new Date();

    setMyName(name);

    let latestTicketName = await getLatestTicket();
    let latestTicketSplit = latestTicketName.split("_");
    let latestTicketIndex = latestTicketSplit[1];

    let newTicketName = "ticket" + "_" + (Number(latestTicketIndex) + 1);

    setDoc(doc(db, "tickets", newTicketName), {
      ticketName: newTicketName,
      Description: [d.toLocaleString() + " (" + name + "): " + description],
      Email: email,
      Name: name,
      Status: "new",
      timestamp: d.toLocaleString(),
    });

    getAllMyTickets(name);
  }

  async function handleResponse(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();
    console.log(e.target.id);
    let d = new Date();

    let response = document.getElementById(e.target.id + "newResponse").value;
    console.log(response);
    updateDoc(doc(db, "tickets", e.target.id), {
      Description: arrayUnion(
        d.toLocaleString() + " (" + myName + "): " + response
      ),
    });
    setTimeout(function () {
      getAllMyTickets(myName);
    }, 300);
  }

  async function updateStatus(e) {
    // Prevent the browser from reloading the page
    e.preventDefault();
    let temp = e.target.id.split("/");
    let newStatus = temp[0];
    let ticketName = temp[1];
    console.log(newStatus, ticketName);

    updateDoc(doc(db, "tickets", ticketName), {
      Status: newStatus,
    });
    setTimeout(function () {
      getAllMyTickets(myName);
    }, 300);
  }

  function handleNameChange(e) {
    console.log(e.target.value);
    setMyName(e.target.value);
    getAllMyTickets(e.target.value);
  }

  function basicDropdown(ticketName) {
    return (
      <DropdownButton id="dropdown-basic-button" title="Update Status">
        <Dropdown.Item onClick={updateStatus} id={"new/" + ticketName}>
          New
        </Dropdown.Item>
        <Dropdown.Item onClick={updateStatus} id={"inProgress/" + ticketName}>
          In-Progress
        </Dropdown.Item>
        <Dropdown.Item onClick={updateStatus} id={"resolved/" + ticketName}>
          Resolved
        </Dropdown.Item>
      </DropdownButton>
    );
  }

  if (myName != "Admin") {
    return (
      <div className="Main">
        <div class="container-fluid">
          <form method="post" onSubmit={handleSubmit}>
            <label>
              Your name:
              <input
                class="userInput"
                id="firstNameInput"
                onInput={handleNameChange}
              />
            </label>
            <label>
              Your email:
              <input class="userInput" id="emailInput" />
            </label>
            <hr />
            <label>Please describe your issue:</label>
            <hr />
            <input class="descriptionInput" id="description" />
            <hr />
            <button type="submit">Submit</button>
          </form>
          <hr />
          <label> My Tickets: </label>
          <hr />
          <div class="container-fluid">
            {myTickets.map((myTicket) => (
              <div>
                <div class="card" id={myTicket.Status}>
                  <div class="card-body">
                    <h5 class="card-title">{myTicket.ticketName}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">
                      Ticket Status: {myTicket.Status}
                    </h6>
                    {myTicket.Description.map((response) => (
                      <div>
                        <p class="card-text">{response}</p>
                        <hr />
                      </div>
                    ))}
                    <form
                      method="post"
                      onSubmit={handleResponse}
                      id={myTicket.ticketName}
                    >
                      <label>
                        Add to this ticket:
                        <input
                          class="response"
                          id={myTicket.ticketName + "newResponse"}
                        />
                      </label>
                      <button type="submit">Submit</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="Main">
        <div class="container-fluid">
          <form method="post" onSubmit={handleSubmit}>
            <label>
              Your name:
              <input
                class="userInput"
                id="firstNameInput"
                onInput={handleNameChange}
              />
            </label>
          </form>
          <hr />
          <label> My Tickets: </label>
          <hr />
          <div class="container-fluid">
            {myTickets.map((myTicket) => (
              <div>
                <div class="card" id={myTicket.Status}>
                  <div class="card-body">
                    <h5 class="card-title">{myTicket.ticketName}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">
                      Ticket Status: {myTicket.Status}
                    </h6>
                    {/* <form
                      method="post"
                      onSubmit={updateStatus}
                      id={myTicket.ticketName}
                    > */}
                    <h6>{basicDropdown(myTicket.ticketName)}</h6>
                    {/* </form> */}
                    {myTicket.Description.map((response) => (
                      <div>
                        <p class="card-text">{response}</p>
                        <hr />
                      </div>
                    ))}
                    <form
                      method="post"
                      onSubmit={handleResponse}
                      id={myTicket.ticketName}
                    >
                      <label>
                        Add to this ticket:
                        <input
                          class="response"
                          id={myTicket.ticketName + "newResponse"}
                        />
                      </label>
                      <button type="submit">Submit</button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
