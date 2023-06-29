require('dotenv').config();
const fs = require('fs');
const { Client, IntentsBitField } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Load XP data from the JSON file
const xpDataPath = './xpData.json';
let xpData = {};

try {
  if (fs.existsSync(xpDataPath)) {
    const data = fs.readFileSync(xpDataPath, 'utf8');
    xpData = JSON.parse(data);
  }
} catch (error) {
  console.error('Error reading JSON file:', error);
}

// creating "User ID"
const userIDs = {
  dario: '231231094811262986',
  gabriel: '208955249627627521',
  taven: '269498883346923526',
  samuel: '252158593669791744',
};

// Tells that the bot is functioning.
client.on('ready', () => {
  console.log('The bot is functioning.');
});

// Creates the !roll command for random number generation.
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore messages from bots - excluding !commands
  if (message.author.id === client.user.id) return;
  
  const args = message.content.slice(1).trim().split(' ');
  const command = args.shift().toLowerCase();

  if (command === 'roll') {
    const content = args.join(' ');
    const match = content.match(/^(\d+)d(\d+)$/);

    if (!match) {
      // If the format is incorrect, reply with an error message
      await message.reply('Invalid roll format. Please use the format "!roll NdN" (e.g., "!roll 4d6").');
      return;
    }

    const numDice = parseInt(match[1]);
    const numSides = parseInt(match[2]);

    if (isNaN(numDice) || isNaN(numSides) || numDice <= 0 || numSides <= 0) {
      // If the dice or sides are not valid numbers, reply with an error message
      await message.reply('Invalid roll format. Please use positive numbers for the dice and sides.');
      return;
    }

    const result = rollMultipleD(numDice, numSides);

    await message.reply(`Rolled ${numDice}d${numSides}: ${result}`);
  }

  if (command === 'addxp') {
    const userId = message.author.id;
    const channelId = message.channel.id;
    const xp = parseInt(args[0]);
  
    if (channelId !== message.channel.id) {
      return message.reply('You can only use this command in the allowed channel.');
    }
  
    if (!xpData[userId]) {
      xpData[userId] = {
        xp: [],
        totalXP: 0
      };
    }
  
    const userXP = xpData[userId];
    const totalXP = userXP.totalXP + xp;
  
    userXP.xp.push(xp);
    userXP.totalXP = totalXP;
  
    // Save the updated XP data to the JSON file
    fs.writeFileSync(xpDataPath, JSON.stringify(xpData));
  
    return message.reply(`Added ${xp} XP. Total XP: ${totalXP}`);
  }

  if (command === 'removexp') {
    const userId = message.author.id;
    const channelId = message.channel.id;
    const xpToRemove = parseInt(args[0]);
  
    if (isNaN(xpToRemove) || xpToRemove <= 0) {
      return message.reply('Please provide a valid positive number for XP.');
    }
  
    if (channelId !== message.channel.id) {
      return message.reply('You can only use this command in the allowed channel.');
    }
  
    const userXP = xpData[userId];
    const totalXP = userXP.totalXP;
  
    if (!userXP || userXP.length === 0) {
      return message.reply('No XP data found for removal.');
    }
  
    const removedXP = -xpToRemove;
    userXP.xp.push(removedXP);
    xpData[userId].totalXP = totalXP - xpToRemove;
  
    // Save the updated XP data to the JSON file
    fs.writeFileSync(xpDataPath, JSON.stringify(xpData));
  
    return message.reply(`Successfully removed ${xpToRemove} XP.`);
  }

  if (command === 'playerlvl') {
    const xpValues = Object.values(xpData).map(user => user.totalXP);
    const totalXP = xpValues.reduce((total, xp) => total + xp, 0);
    const averageXP = totalXP / xpValues.length;
    
    let level = 1;
    
    if (averageXP >= 0 && averageXP < 300) {
      level = 1;
    } else if (averageXP >= 300 && averageXP < 900) {
      level = 2;
    } else if (averageXP >= 900 && averageXP < 2700) {
      level = 3;
    } else if (averageXP >= 2700 && averageXP < 6500) {
      level = 4;
    } else if (averageXP >= 6500 && averageXP < 14000) {
      level = 5;
    } else if (averageXP >= 14000 && averageXP < 23000) {
      level = 6;
    } else if (averageXP >= 23000 && averageXP < 34000) {
      level = 7;
    } else if (averageXP >= 34000 && averageXP < 48000) {
      level = 8;
    } else if (averageXP >= 48000 && averageXP < 64000) {
      level = 9;
    } else if (averageXP >= 64000 && averageXP < 85000) {
      level = 10;
    } else if (averageXP >= 85000 && averageXP < 100000) {
      level = 11;
    } else if (averageXP >= 100000 && averageXP < 120000) {
      level = 12;
    } else if (averageXP >= 120000 && averageXP < 140000) {
      level = 13;
    } else if (averageXP >= 140000 && averageXP < 165000) {
      level = 14;
    } else if (averageXP >= 165000 && averageXP < 195000) {
      level = 15;
    } else if (averageXP >= 195000 && averageXP < 225000) {
      level = 16;
    } else if (averageXP >= 225000 && averageXP < 265000) {
      level = 17;
    } else if (averageXP >= 265000 && averageXP < 305000) {
      level = 18;
    } else if (averageXP >= 305000 && averageXP < 355000) {
      level = 19;
    } else if (averageXP >= 355000) {
      level = 20;
    }
  
    return message.reply(`Your average XP is ${averageXP}. Your Player's level should be: ${level}.`);
  }
});

function rollD(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollMultipleD(numDice, sides) {
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += rollD(sides);
  }
  return total;
}

// Function to update xpData file by clearing xp values and setting totalXP
function updateXPData() {
  for (const userId in xpData) {
    xpData[userId].xp = []; // Clear xp values
    xpData[userId].xp.push(xpData[userId].totalXP); // Set xp to totalXP
  }

  // Save the updated XP data to the JSON file
  fs.writeFileSync(xpDataPath, JSON.stringify(xpData));
}

// Schedule the routine to run every day at a specific time (e.g., 12:00 AM)
const schedule = require('node-schedule');

const updateXPDataJob = schedule.scheduleJob('0 0 * * *', () => {
  updateXPData();
});

client.login(process.env.TOKEN);