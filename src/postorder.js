var tree = {
  "name" : "1. root",
  "children" : [
    {
      "name" : "2. child 1",
      "children" : [
        {
          "name" : "4. child of 1 #1",
          "children" : []
        },
        {
          "name" : "5. child of 1 #2",
          "children" : []
        }
      ]
    },
    {
      "name" : "3. child 2",
      "children" : [
        {
          "name" : "--child of 2 #1",
          "children" : []
        },
        {
          "name" : "--child of 2 #2",
          "children" : []
        }
      ]
    }
  ]
}

function postOrder(root) {
  if (root.children == null) return;
  //root.children.forEach(postOrder);
  for (var i=0; i<root.children.length;i++) {
    postOrder(root.children[i]);
  }
  console.log(root.name);
}
postOrder(tree);