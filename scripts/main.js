//FETCH
const url = document.title.includes("Senate")
    ? "senate" : "house"

    let init = {
        headers:{
            "X-API-Key" : "BV05JW4OqcTtDjT3oFxRWAAfelq9TmfCE646Pf9e"
        }
    }

fetch(`https://api.propublica.org/congress/v1/113/${url}/members.json`, init)
    .then(response => response.json())
    .then(json => {
        let data = [...json.results[0].members]
        takeData(data)
    })
    .catch(error => {
        console.log(error.message)
    })

const takeData = ((data) => {
    var membersObject = data


    if(document.title == "House" || document.title == "Senate"){

        var filterParty = ["D", "R", "ID"]
        var filterState = "alls"
        var newData = []
        var finalData = []
        
        function showFilters(){
            if (filterState == "alls") {
                newData = membersObject
            } else {
                newData = membersObject.filter(member => member.state == filterState)
            }
            
            finalData = []
            newData.forEach(member => {
                let party = member.party
                if (party == "D" && filterParty.includes("D")) {
                    finalData.push(member)
                } else if (party == "R" && filterParty.includes("R")) {
                    finalData.push(member)
                } else if (party == "ID" && filterParty.includes("ID")) {
                    finalData.push(member)
                }
            })
        }
        
        function addTable() {
            document.getElementById("table").innerHTML = " "
            showFilters()
            finalData.forEach(member => {
                let tableRow = document.createElement("tr")
                let tableCell = document.createElement("td")
                let tableLink = document.createElement("a")
                tableLink.href = member.url
                tableLink.target = "_blank"
                tableLink.innerText = `${member.last_name} ${member.first_name} ${member.middle_name || ""}`
                tableCell.appendChild(tableLink)
                tableRow.appendChild(tableCell)
                let tableParty = document.createElement("td")
                tableParty.innerText = member.party
                tableRow.appendChild(tableParty)
                let tableState = document.createElement("td")
                tableState.innerText = member.state
                tableRow.appendChild(tableState)
                let tableOffice = document.createElement("td")
                tableOffice.innerText = member.seniority
                tableRow.appendChild(tableOffice)
                let tableVotes = document.createElement("td") 
                tableVotes.innerText = member.votes_with_party_pct
                tableRow.appendChild(tableVotes)
                document.getElementById("table").appendChild(tableRow)
            })
        }
        
        addTable()
        

        //FILTER SELECT (STATES)

        let newStates = []
        
        membersObject.forEach(member => {
            if (newStates.indexOf(member.state) === -1) {
                newStates.push(member.state)
            }
        })
        
        newStates.forEach(state => {
            let tableOption = document.createElement("option")
            tableOption.innerText = state
            tableOption.value = state
            document.getElementById("selectState").appendChild(tableOption)
        })
        
        document.getElementById("selectState").addEventListener("change", (e) => {
            filterState = e.target.value
            addTable()
        })
        

        //FILTER CHECKBOX (PARTIES)
        
        let inputsCheck = document.getElementsByName('party') 
        inputsCheck = Array.from(inputsCheck)
        
        inputsCheck.forEach(input => { 
            input.addEventListener('change', (e) => { 
            let theInput = e.target.value
            let inputChecked = e.target.checked
            if (filterParty.includes(theInput) && !inputChecked) {
                filterParty = filterParty.filter(party => party !== theInput) 
                console.log(filterParty)
            } else if (!filterParty.includes(theInput) && inputChecked) {
                    filterParty.push(theInput)
            }
            addTable()
            })
        })

    } else{ 
        

        //STATISTICS

        let statistics = {
            democrats :[], //ARRAY MEMBERS D
            nroDemocrats:null, //CANTIDAD DE D
            votesWPartyD:null,  // ARRAY % DE VOTES WITH PARTY POR PARTIDO
            porcentWPartyD:null, // EL % TOTAL DE LA SUMA DE TODOS MIS DEMOCRATAS DE VOTOS X PARTIDO
            votesMissedD:null, // ARRAY % DE MISSED VOTES
            averageMissedD:null,  // EL PROMEDIO EN % TOTAL DE LA SUMA DE TODOS LOS MISSDE VOTES

            republicans:[],
            nroRepublicans: null,
            votesWPartyR:null,
            porcentWPartyR:null,
            votesMissedR:null,
            averageMissedR:null,

            independents:[],
            nroIndependents:null,
            votesWPartyID:null,
            porcentWPartyID:null,
            votesMissedID:null,
            averageMissedID:null,
        
            totalParties:null,

            //attendance data
            leastEngaged:null,
            mostEngaged:null, 

            //sparty data
            leastLoyal:null,
            mostLoyal:null,
        }

        // console.log(statistics)

        // PARTIES FILTER

        statistics.democrats = membersObject.filter(member => member.party === "D") 
        statistics.nroDemocrats = statistics.democrats.length 

        statistics.republicans = membersObject.filter(member => member.party === "R") 
        statistics.nroRepublicans = statistics.republicans.length

        statistics.independents = membersObject.filter(member => member.party === "ID")
        statistics.nroIndependents = statistics.independents.length

        //CALC TOTAL PARTIES
        statistics.totalParties = membersObject.length
        

        //EXTRAIGO LOS VOTES WITH PARTY PCT PARA DESPUES SUMARLOS

        //VOTES WITH PARTY
        let withPartyD = []  
        let withPartyR = []
        let withPartyID = []

        //VOTES MISSED
        let missedD = [] 
        let missedR = []
        let missedID = []

        function createArray(party, array1, array2, statisticParty,statisticMissed ){
            party.forEach(member => {   
                array1.push(member.votes_with_party_pct)  
                array2.push(member.missed_votes_pct) 
            })
        
            statisticParty = array1
            statisticMissed = array2
        }

        createArray(statistics.democrats, withPartyD, missedD, statistics.votesWPartyD, statistics.votesMissedD)
        createArray(statistics.republicans, withPartyR, missedR, statistics.votesWPartyR, statistics.votesMissedR)
        // createArray(statistics.independents, withPartyID, missedID, statistics.votesWPartyID, statistics.votesMissedID)


        // CALC PROMEDIOS MISSED P/ ATTENDANCE

        let calcMissedD = (missedD.reduce((total, number) => total + number) / statistics.nroDemocrats).toFixed(2) 
        // console.log(calcMissedD)
        statistics.averageMissedD = calcMissedD

        let calcMissedR = (missedR.reduce((total, number) => total + number) / statistics.nroRepublicans).toFixed(2) 
        // console.log(calcMissedR)
        statistics.averageMissedR = calcMissedR

        // let calcMissedID = (missedID.reduce((total, number) => total + number) / statistics.nroIndependents).toFixed(2) 
        // // console.log(calcMissedID)
        // statistics.averageMissedID = calcMissedID 


        // CALC PROMEDIOS MISSED P/ PARTY LOYALTY
        
        let calcVotesD = (withPartyD.reduce((total, number) => total + number) / statistics.nroDemocrats).toFixed(2) 
        // console.log(calcMissedD)
        statistics.porcentWPartyD = calcVotesD

        let calcVotesR = (withPartyR.reduce((total, number) => total + number) / statistics.nroRepublicans).toFixed(2) 
        // console.log(calcMissedD)
        statistics.porcentWPartyR = calcVotesR

        // let calcVotesID = (withPartyID.reduce((total, number) => total + number) / statistics.nroIndependents).toFixed(2) 
        // // console.log(calcMissedD)
        // statistics.porcentWPartyID = calcVotesID


        //CALCULAR DATOS P/ CADA TABLA

        amountMembers = Math.ceil(membersObject.length / 10)

        let data1 = membersObject.filter(member => member.total_votes !== 0)
        data1.sort((a,b) => b.missed_votes_pct - a.missed_votes_pct)
        statistics.leastEngaged = data1.slice(0,amountMembers)

        let data2 = membersObject.filter(member => member.total_votes !== 0)
        data2.sort((a,b) => a.missed_votes_pct - b.missed_votes_pct)
        statistics.mostEngaged = data2.slice(0,amountMembers)

        let data3 = membersObject.filter(member => member.total_votes !== 0)
        data3.sort((a,b) => a.votes_with_party_pct - b.votes_with_party_pct)
        statistics.leastLoyal = data3.slice(0,amountMembers)

        let data4 = membersObject.filter(member => member.total_votes !== 0)
        data4.sort((a,b) => b.votes_with_party_pct - a.votes_with_party_pct)
        statistics.mostLoyal = data4.slice(0,amountMembers)


        //RENDER TABLAS

        function addAtAGlace(nameParty, numberParty, average, father){ //intentar hacerlo statico
            let row = document.createElement("tr")
            let party = document.createElement("td")
            party.innerText = nameParty
            let nroParty = document.createElement("td")
            nroParty.innerText = numberParty
            let averageMissed = document.createElement("td")
            averageMissed.innerText = `${average || "- - -"}    `
            row.appendChild(party)
            row.appendChild(nroParty)
            row.appendChild(averageMissed)
            document.getElementById(father).appendChild(row)
        }


        //ATENDANCE

            function addLeastE() {
                statistics.leastEngaged.forEach(member => {
                    let tableRow = document.createElement("tr")
                    let tableCell = document.createElement("td")
                    let tableLink = document.createElement("a")
                    tableLink.href = member.url
                    tableLink.target = "_blank"
                    tableLink.innerText = `${member.last_name} ${member.first_name} ${member.middle_name || " "}`
                    let nroMissed = document.createElement("td")
                    nroMissed.innerText = member.missed_votes
                    let porcentMissed = document.createElement("td")
                    porcentMissed.innerText = `${member.missed_votes_pct.toFixed(2)} %`
                    tableRow.appendChild(tableCell)
                    tableCell.appendChild(tableLink)
                    tableRow.appendChild(nroMissed)
                    tableRow.appendChild(porcentMissed)
                    document.getElementById("leastEngaged").appendChild(tableRow)
                })
            }

            function addMostE() {
                statistics.mostEngaged.forEach(member => {
                    let tableRow = document.createElement("tr")
                    let tableCell = document.createElement("td")
                    let tableLink = document.createElement("a")
                    tableLink.href = member.url
                    tableLink.target = "_blank"
                    tableLink.innerText = `${member.last_name} ${member.first_name} ${member.middle_name || " "}`
                    let nroMissed = document.createElement("td")
                    nroMissed.innerText = Math.ceil(member.missed_votes)
                    let porcentMissed = document.createElement("td")
                    porcentMissed.innerText = `${(member.missed_votes_pct / 100).toFixed(2)} %`
                    tableRow.appendChild(tableCell)
                    tableCell.appendChild(tableLink)
                    tableRow.appendChild(nroMissed)
                    tableRow.appendChild(porcentMissed)
                    document.getElementById("mostEngaged").appendChild(tableRow)
                })
            }
            
            //PARTY

            function addLeastL() {
                statistics.leastLoyal.forEach(member => {
                    let tableRow = document.createElement("tr")
                    let tableCell = document.createElement("td")
                    let tableLink = document.createElement("a")
                    tableLink.href = member.url
                    tableLink.target = "_blank"
                    tableLink.innerText = `${member.last_name} ${member.first_name} ${member.middle_name || " "}`
                    let nroPVotes = document.createElement("td")
                    nroPVotes.innerText = parseInt((member.total_votes - member.missed_votes) * member.votes_with_party_pct / 100)
                    let averageWParty = document.createElement("td")
                    averageWParty.innerText = `${member.votes_with_party_pct} %`
                    tableRow.appendChild(tableCell)
                    tableCell.appendChild(tableLink)
                    tableRow.appendChild(nroPVotes)
                    tableRow.appendChild(averageWParty)
                    document.getElementById("leastLoyalty").appendChild(tableRow)
                })
            }

            function addMostL() {
                statistics.mostLoyal.forEach(member => {
                    let tableRow = document.createElement("tr")
                    let tableCell = document.createElement("td")
                    let tableLink = document.createElement("a")
                    tableLink.href = member.url
                    tableLink.target = "_blank"
                    tableLink.innerText = `${member.last_name} ${member.first_name} ${member.middle_name || " "}`
                    let nroPVotes = document.createElement("td")
                    nroPVotes.innerText = parseInt((member.total_votes - member.missed_votes) * member.votes_with_party_pct / 100)
                    let averageWParty = document.createElement("td")
                    averageWParty.innerText = `${member.votes_with_party_pct} %`
                    tableRow.appendChild(tableCell)
                    tableCell.appendChild(tableLink)
                    tableRow.appendChild(nroPVotes)
                    tableRow.appendChild(averageWParty)
                    document.getElementById("mostLoyalty").appendChild(tableRow)
                })
            }


        if(document.title == "House Attendance" || document.title == "Senate Attendance"){
        
            addAtAGlace("Democrats", statistics.nroDemocrats, statistics.averageMissedD, "atAGlance") //padre en table
            addAtAGlace("Republicans", statistics.nroRepublicans, statistics.averageMissedR, "atAGlance")
            addAtAGlace("Independents", statistics.nroIndependents, statistics.averageMissedID, "atAGlance")
            addAtAGlace("TOTAL", statistics.totalParties, statistics.totalAverageMissed, "atAGlance")

            addLeastE()
        
            addMostE()
            
        } else {

            addAtAGlace("Democrats", statistics.nroDemocrats, statistics.porcentWPartyD, "atAGlance")
            addAtAGlace("Republicans", statistics.nroRepublicans, statistics.porcentWPartyR, "atAGlance")
            addAtAGlace("Independents", statistics.nroIndependents, statistics.porcentWPartyID, "atAGlance")
            addAtAGlace("TOTAL", statistics.totalParties, statistics.totalPorcentVWParty, "atAGlance")

            addLeastL()

            addMostL()

        }
    }
})

