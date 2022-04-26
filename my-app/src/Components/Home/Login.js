import React from 'react';
import "./Login.css"
import { useNavigate } from 'react-router-dom'; 
import {
    Flex,
    FormControl,
    Input,
    Stack,
    Button
  } from '@chakra-ui/react';

const Login = () => {
    let navigate = useNavigate();

    const onSubmit = () => {
        navigate('/home', {replace: true})
    }

    return (
        <Flex minH={'90vh'} align={'center'} justify={'center'} >
            <Stack>
                <img src = "login-logo.png" width = {450} alt = "Grassroots Grocery Logo" />

                <FormControl>
                    <Input placeholder = 'Username' className = 'loginInfo'/>
                </FormControl>

                <FormControl>
                    <Input placeholder = 'Password' type = 'password' className = 'loginInfo'/>
                </FormControl>
                
                <br/>

                <div>
                    <Button onClick = {onSubmit} className = 'loginButton' width = '400px' borderRadius = '7px'>
                        Login 
                    </Button>
                </div>

            </Stack>
            
        </Flex>
    )
}

export default Login