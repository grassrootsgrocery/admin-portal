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
                <img src = {"login-logo.png"} width = {360} alt = {"Grassroots Grocery Logo"} />

                <br/>

                <FormControl>
                    <Input placeholder = 'Username' />
                </FormControl>

                <FormControl>
                    <Input placeholder = 'Password' type = 'password'/>
                </FormControl>
                
                <br/>

                <Button onClick = {onSubmit} borderRadius = {"7px"}>
                    Login 
                </Button>

            </Stack>
            
        </Flex>
    )
}

export default Login