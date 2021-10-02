var data_json_criminal_string = `{
    "nodes": [
        { "id": "Joe Smith",  "type": "person", "name": "Joe Smith", "photo": "http://i.imgur.com/gwlPu.jpg" },
        { "id": "AR-784723",  "type": "arrest" },
        { "id": "vehicle",    "type": "vehicle" },
        { "id": "FU-0001089", "type": "case" },
        { "id": "robbery",    "type": "court_case" },

        { "id": "family", "type": "Family" },
            { "id": "Lisa Smith", "type": "person", "relationship": "Wife", "age": "42", 
                    "degree_of_relationship": "0", "photo": "https://randomuser.me/api/portraits/women/33.jpg" },
            { "id": "Edward Smith", "type": "person", "relationship": "Son", "age": "18", 
                    "degree_of_relationship": "1", "photo": "https://randomuser.me/api/portraits/men/22.jpg" },
            { "id": "Cindy Smith", "type": "person", "relationship": "Daughter", "age": "16", 
                    "degree_of_relationship": "1", "photo": "https://randomuser.me/api/portraits/women/33.jpg" },

        { "id": "Known Addresses", "type": "location" },
            { "id": "808 W. Spokane Blvd., Spokane WA", "type": "address" },
            { "id": "188 Hunters Dr, Los Angeles CA", "type": "address" },
            { "id": "3256 East Market St, Los Angeles CA", "type": "address" }
    ],
    "links": [
        { "source" : "Joe Smith",       "target": "AR-784723" },
        { "source" : "AR-784723",       "target": "robbery" },
        { "source" : "Joe Smith",       "target": "Known Addresses" },
        { "source" : "Joe Smith",       "target": "family" },
        { "source" : "Joe Smith",       "target": "vehicle" },
        { "source" : "Joe Smith",       "target": "FU-0001089" },
        { "source" : "family",          "target": "Lisa Smith" },
        { "source" : "family",          "target": "Edward Smith" },
        { "source" : "family",          "target": "Cindy Smith" },
        { "source" : "Known Addresses", "target": "808 W. Spokane Blvd., Spokane WA" },
        { "source" : "Known Addresses", "target": "188 Hunters Dr, Los Angeles CA" },
        { "source" : "Known Addresses", "target": "3256 East Market St, Los Angeles CA" }
    ]
}`;