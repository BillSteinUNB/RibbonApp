import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { useRecipientStore } from '../store/recipientStore';

export default function RecipientsLayout() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const recipients = useRecipientStore(state => state.recipients);
  
  const recipient = useMemo(() => {
    if (!id) return null;
    return recipients.find(r => r.id === id);
  }, [id, recipients]);

  const getHeaderTitle = () => {
    if (!id) return 'Recipients';
    return recipient?.name || 'Gift Ideas';
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Recipients',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="new" 
        options={{ 
          title: 'New Recipient',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="[id]/index" 
        options={{ 
          title: getHeaderTitle(),
        }} 
      />
      <Stack.Screen 
        name="[id]/ideas" 
        options={{ 
          title: getHeaderTitle(),
        }} 
      />
      <Stack.Screen 
        name="[id]/results" 
        options={{ 
          title: getHeaderTitle(),
        }} 
      />
      <Stack.Screen 
        name="[id]/edit" 
        options={{ 
          title: 'Edit Recipient',
        }} 
      />
    </Stack>
  );
}
