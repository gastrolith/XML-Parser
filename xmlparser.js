function writeInfoToTXT(info, outputFile) {

}

function extractInfo(fileContents) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(fileContents, "text/xml");
    
        const tiers = xmlDoc.getElementsByTagName("CONTROLLED_VOCABULARY");
        
        let info = "";

        for (let tier of tiers) {
            info = info + tier.getAttribute("CV_ID") + "\n";

            const terms = tier.getElementsByTagName("CVE_VALUE");

            for (let term of terms) {
                if (term.textContent == "") {
                    info = info + "   " + term.getAttribute("DESCRIPTION") + "\n";
                } else if (term.getAttribute("DESCRIPTION") == "") {
                    info = info + "   " + term.textContent + "\n";   
                } else {
                    info = info + "   " + term.textContent + " / " + term.getAttribute("DESCRIPTION") + "\n";
                }
          }
        }

        return info;
    }
    catch (error) {
        console.error("Error parsing file:", error);
        return null;
    }
}

function main() {
    // Grab file(s) from input
    const fileOption = document.getElementById('fileoption');
    let fileInput;

    if (fileOption.checked) {
        fileInput = document.getElementById('XMLfile');
    } else {
        fileInput = document.getElementById('XMLfolder');
    }

    const readPromises = [];

    for (let file of fileInput.files) {
        const promise = new Promise((resolve, reject) => {
            const reader = new FileReader();
    
            reader.onload = function(event) {
                let appendage = extractInfo(event.target.result);
            
                if (appendage != "") {
                    resolve(`-- ${file.name} --\n${appendage}`);
                } else {
                    resolve("");
                }
            };
    
            reader.onerror = function(error) {
                console.error(error);
            };
            
            reader.readAsText(file);
        });

        readPromises.push(promise);
    }

    Promise.all(readPromises)
    .then(results => {
        const toWrite = results.filter(text => text !== "");
        if (toWrite.length === 0) {
            alert("No valid XML data found in the selected file(s).");
            return;
        } else {
            const blob = new Blob([toWrite.join("\n\n**********\n\n")], { type: 'text/plain' });

            const link = document.getElementById('download-link');
            link.href = URL.createObjectURL(blob);
            link.download = "parsedXML.txt";

            const downloadButton = document.getElementById('download-button');
            downloadButton.disabled = false;
        }
    })
    .catch(error => {
        console.error("Error reading one or more files:", error);
    });
}

function download() {
    const link = document.getElementById('download-link');
    link.click();
}