var data_json_criminal_string = `{
    "nodes": [
        { "id": "Joe Smith",  "type": "person", "name": "Joe Smith", "photo": "http://i.imgur.com/gwlPu.jpg" },

        { "id": "AR-784723",  "type": "arrest" },
        { "id": "vehicle",    "type": "vehicle" },
        { "id": "FU-0001089", "type": "case" },
        { "id": "robbery",    "type": "court_case" },

        { "id": "family1", "type": "Family" },
            { "id": "Lisa Smith", "type": "person", "relationship": "Wife", "age": "42", 
                    "degree_of_relationship": "0", "photo": "https://randomuser.me/api/portraits/women/33.jpg" },
            { "id": "Edward Smith", "type": "person", "relationship": "Son", "age": "18", 
                    "degree_of_relationship": "1", "photo": "https://randomuser.me/api/portraits/men/22.jpg" },
            { "id": "Cindy Smith", "type": "person", "relationship": "Daughter", "age": "16", 
                    "degree_of_relationship": "1", "photo": "https://randomuser.me/api/portraits/women/33.jpg" },

        { "id": "Known Addresses1", "type": "location" },
            { "id": "808 W. Spokane Blvd., Spokane WA", "type": "address" },
            { "id": "188 Hunters Dr, Los Angeles CA", "type": "address" },
            { "id": "3256 East Market St, Los Angeles CA", "type": "address" },

        { "id": "Billy Bob",  "type": "person", "name": "Billy Bob", "photo": "http://i.imgur.com/gwlPu.jpg" },
        { "id": "AR-784724",  "type": "arrest" },
        { "id": "Known Addresses2", "type": "location",  "label": "Known Addresses"},
        { "id": "family2",          "type": "Family",    "label": "Family"},
        { "id": "case2",            "type": "case" },
        { "id": "work2",            "type": "case" }
    ],
    "links": [
        { "source" : "Joe Smith",       "target": "AR-784723" },
        { "source" : "AR-784723",       "target": "robbery" },
        { "source" : "Joe Smith",       "target": "Known Addresses1" },
        { "source" : "Joe Smith",       "target": "family1" },
        { "source" : "Joe Smith",       "target": "vehicle" },
        { "source" : "Joe Smith",       "target": "FU-0001089" },
        { "source" : "family1",          "target": "Lisa Smith" },
        { "source" : "family1",          "target": "Edward Smith" },
        { "source" : "family1",          "target": "Cindy Smith" },
        { "source" : "Known Addresses1", "target": "808 W. Spokane Blvd., Spokane WA" },
        { "source" : "Known Addresses1", "target": "188 Hunters Dr, Los Angeles CA" },
        { "source" : "Known Addresses1", "target": "3256 East Market St, Los Angeles CA" },

        { "source" : "robbery",           "target": "AR-784724" },
        { "source" : "AR-784724",         "target":"Billy Bob"},
        { "source" : "Billy Bob",         "target":"Known Addresses2"},
        { "source" : "Billy Bob",         "target":"family2"},
        { "source" : "Billy Bob",         "target":"case2"},
        { "source" : "Billy Bob",         "target":"work2"}
    ]
}`;