import AgentProposalResponseScreen from '../../src/screens/agent/AgentProposalResponseScreen';

export const unstable_settings = { initialRouteName: 'proposal-response' };

export default function ProposalResponseRoute() {
  return <AgentProposalResponseScreen />;
}

export const screenOptions = {
  headerShown: false,
}; 