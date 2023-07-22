//http://localhost:3000/api/users

export async function GET(request) {
  //handle get request for api/bets
  //retrieve users from the database or any other source
  const users = [
    { id: 1, name: "John" },
    { id: 1, name: "John" },
    { id: 1, name: "John" },
  ];

  return new Response(JSON.stringify(users));
}

export async function POST(request: Request) {}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

//GET (read)
//PACTH (update)
//DELETE (delete)
