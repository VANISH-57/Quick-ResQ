import { MongoClient } from "mongodb";

async function updateMechanicNames() {
  const uri = "mongodb://localhost:27017"; // change if needed
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("quick_resq"); // replace with your DB name
    const collection = db.collection("mechanics"); // replace with your collection name

    const mechanicNames = [
      "Arun Kumar", "Deepak Sharma", "Ravi Patel", "Suresh Reddy", "Vikram Singh",
      "Manoj Joshi", "Kiran Nair", "Ajay Mehta", "Prakash Rao", "Sanjay Gupta",
      "Rahul Verma", "Anil Chauhan", "Vivek Desai", "Naveen Iyer", "Rajesh Pillai",
      "Ashok Menon", "Sunil Bhat", "Mahesh Yadav", "Gopal Das", "Harish Malhotra",
      "Balaji Krishnan", "Vinod Shetty", "Shankar Prasad", "Ramesh Kulkarni", "Devendra Mishra",
      "Pankaj Saxena", "Santosh Dubey", "Kailash Rawat", "Narendra Jha", "Hemant Kaul",
      "Suraj Thakur", "Mohan Lal", "Chandan Roy", "Parthiban Nair", "Siddharth Sen",
      "Lokesh Jain", "Sharad Ghosh", "Yogesh Pawar", "Nitin Chatterjee", "Rajiv Kapoor",
      "Alok Banerjee", "Bhaskar Reddy", "Dinesh Menon", "Ganesh Iyer", "Harendra Singh",
      "Imran Khan", "Jagat Prasad", "Keshav Rao", "Lalit Sharma", "Madhav Pillai",
      "Nirmal Das", "Omkar Joshi", "Pradeep Verma", "Qasim Ali", "Raghavendra Rao",
      "Satish Nair", "Tapan Ghosh", "Umesh Yadav", "Varun Malhotra", "Wasim Sheikh",
      "Xavier D Souza", "Yashwant Singh", "Zubair Khan", "Abhishek Mehta", "Bharat Patel",
      "Chirag Shah", "Dipesh Chauhan", "Eshan Reddy", "Farhan Ali", "Girish Kulkarni",
      "Hitesh Sharma", "Iqbal Hussain", "Jitendra Singh", "Kartik Iyer", "Lakshman Rao",
      "Manish Gupta", "Naveen Kumar", "Om Prakash", "Pravin Shetty", "Qadir Hussain",
      "Rohit Desai", "Sandeep Nair", "Tarun Kapoor", "Uday Joshi", "Vishal Chauhan",
      "Waman Kulkarni", "Xavier Fernandes", "Yogendra Singh", "Zakir Hussain", "Anant Rao",
      "Bhavesh Shah", "Chetan Patel", "Dilip Kumar", "Eklavya Singh", "Feroz Khan"
    ];

    for (let i = 0; i < mechanicNames.length; i++) {
      await collection.updateOne(
        { name: `Mechanic ${i + 1}` },
        { $set: { name: mechanicNames[i] } }
      );
    }

    console.log("Mechanic names updated successfully!");
  } finally {
    await client.close();
  }
}

updateMechanicNames().catch(console.error);