function showForm(form){

    const loginForm=document.getElementById("login-form");
    const registerForm=document.getElementById("register-form");

    const buttons=document.querySelectorAll(".tab-btn");

    if(form==="login"){

        loginForm.style.display="block";
        registerForm.style.display="none";

        buttons[0].classList.add("active");
        buttons[1].classList.remove("active");

    }

    else{

        loginForm.style.display="none";
        registerForm.style.display="block";

        buttons[0].classList.remove("active");
        buttons[1].classList.add("active");

    }

}

window.onload=function(){

    showForm("login");

};

// ================= LOGIN =================

const loginForm=document.getElementById("login-form");

if(loginForm){

    loginForm.addEventListener("submit",async(e)=>{

        e.preventDefault();

        const roll_number=document.getElementById("roll_number").value.trim();
        const password=document.getElementById("password").value;

        try{

            const response=await fetch("https://campus-request-management-backend.onrender.com/api/student/login",{

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    roll_number,
                    password
                })

            });

            const data=await response.json();

            if(response.ok){

                localStorage.setItem("token",data.token);

                localStorage.setItem(
                    "student",
                    JSON.stringify(data.student)
                );

                alert("Login Successful");

                window.location.href="student-dashboard.html";

            }

            else{

                alert(data.message);

            }

        }

        catch(error){

            console.log(error);

            alert("Unable to connect to server.");

        }

    });

}



// ================= REGISTRATION =================

async function studentRegister(event){

    event.preventDefault();

    const name=document.getElementById("register-name").value.trim();

    const email=document.getElementById("register-email").value.trim();

    const roll_number=document.getElementById("register-roll").value.trim();

    const department_id=document.getElementById("register-department").value;

    const password=document.getElementById("register-password").value;

    const confirmPassword=document.getElementById("confirm-password").value;

    if(password!==confirmPassword){

        alert("Passwords do not match.");

        return;

    }

    try{

        const response=await fetch("https://campus-request-management-backend.onrender.com/api/student/register",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                name,
                email,
                roll_number,
                department_id,
                password

            })

        });

        const data=await response.json();

        if(response.ok){

            alert(data.message);

            document.getElementById("register-form").reset();

            showForm("login");

        }

        else{

            alert(data.message);

        }

    }

    catch(error){

        console.log(error);

        alert("Unable to connect to server.");

    }

}