import DefaultData from '../config/default.js';

const normalizeResponse = (response) => {
	// Remove quotes in end and beggining of the string
	// Remove line breaks in beggining of the text
	let result = response
		.replace(/^\n+/, '')
		.replace(/^\s+/, '')
		.replace(/"$/, '')
		.replace(/^"/, '');

	return result;
};


export const askGPT = async(text, history, userAPIKey, model = 'text-davinci-003') => {
  if (!text || !userAPIKey) 
    return {error: true, message: 'You need to set your OpenAI API key in settings'}
  let prompt = DefaultData.input;
  prompt = prompt.replace('{human_input}', text);
  prompt = prompt.replace('{history}', history);

  // For testing return random phrases

  const phrases = ['I am a bot', 'This is a test', 'Are you a bot?', 'I am a human'];

  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  //return randomPhrase;

  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userAPIKey}`

    },
    body: JSON.stringify({
      model,
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.9,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6,
      stop: ['\n', 'Human:', 'AI:']
    })
  });

  const data = await response.json();
  let result = data.choices[0].text;
  // Remove line breaks in beggining of the text
  result = result
    .replace(/^\n+/, '')
    .replace(/^\s+/, '');
  return {error: false, result};
};

export const generateTitle = async(text, userAPIKey) => {
  const prompt = DefaultData
    .promptTitle
    .replace('{message}', text);
  const response = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userAPIKey}`
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 30,
      temperature: 0.9,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0.6
    })
  });

  const data = await response.json();
  let result = data.choices[0].text; // Remove new line
  result = result
    .replace('\n', '')
    .replace(/"/g, '');
  return result;
};


export const processSerpResults = async(query, results, userAPIKey) => {

  if (!query || !userAPIKey) 
    return {error: true, message: 'You need to set your OpenAI API key in settings'}
  const prompt = DefaultData
    .serpPrompt
    .replace('{message}', query)
    .replace('{result}', results);
  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userAPIKey}`
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 300,
        temperature: 0.9,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0.6
      })
    });

    const data = await response.json();
	if(!data.choices || !data.choices[0] || !data.choices[0].text)
		return {error: true, message: 'No result from OpenAI'}
    let result = normalizeResponse(data.choices[0].text);
    return {error: false, result};
  } catch (error) {
    return {error: true, message: error.message}
  }
};