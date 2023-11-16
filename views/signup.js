function signup(event){ 
    event.preventDefault();

    const name =event.target.name.value;
    const email=event.target.email.value;
    const password=event.target.password.value;


    const signupDetails ={
        name,
        email,
        password
    }
    axios.post("http://51.20.76.161:3000/user/signup",signupDetails)
    .then((response)=>{
        console.log(response)
        if(response.status===201){
            window.location.href="./login.html"
        }else{
            throw new Error('Failed to login')
        }
    })
    .catch((err)=>{
        console.log(err)
        document.body.innerHTML += `<div style="color: red;">${err}</div>`;
    })

    }