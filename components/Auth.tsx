import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { Input, Button } from '@rneui/themed';
import { supabase } from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Error', error.message);
  }

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Error', error.message);
    else Alert.alert('Check your email to confirm signup');
  }

  return (
    <View>
      <Input label="Email" onChangeText={setEmail} value={email} />
      <Input label="Password" secureTextEntry onChangeText={setPassword} value={password} />
      <Button title="Sign In" onPress={signIn} />
      <Button title="Sign Up" onPress={signUp} />
    </View>
  );
}
