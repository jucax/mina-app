#!/usr/bin/env python3
import re

# Read the file
with open('src/screens/agent/AgentPropertyListScreen.tsx', 'r') as f:
    content = f.read()

# Fix the Dimensions destructuring
content = re.sub(
    r'const \{\s*subscriptionValidity,\s*width,\s*height\s*\} = Dimensions\.get\(\'window\'\);',
    'const { width, height } = Dimensions.get(\'window\');',
    content
)

# Fix the loadProperties function destructuring
content = re.sub(
    r'const \{\s*subscriptionValidity,\s*data,\s*error\s*\} = await supabase',
    'const { data, error } = await supabase',
    content
)

# Fix the JSX expression
content = re.sub(
    r'subscriptionValidity \{subscriptionStatus &&\{subscriptionStatus && \(',
    '{subscriptionValidity && (',
    content
)

# Fix the loadUserProfile function - add missing closing brace
content = re.sub(
    r'(\s+} catch \(error\) \{\s+console\.error\(\'Error loading user profile:\', error\);\s+}\s+)(const loadProperties = async \(\) => \{)',
    r'\1  };\n\n  \2',
    content
)

# Write the fixed content back
with open('src/screens/agent/AgentPropertyListScreen.tsx', 'w') as f:
    f.write(content)

print("Fixed AgentPropertyListScreen.tsx comprehensively")
