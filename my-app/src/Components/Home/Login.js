import React from 'react';
import "./Login.css"
import { useNavigate } from 'react-router-dom'; 
import {
    Flex,
    Box,
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
                <img src={"login-logo.png"} width={360} />

                <br/>

                <FormControl>
                    <Input placeholder = 'Username' />
                </FormControl>

                <FormControl>
                    <Input placeholder = 'Password' />
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