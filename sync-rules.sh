#!/bin/bash
# Auto-sync RULE-SET files from upstream sources
# Run weekly: crontab -e -> 0 0 * * 0 /path/to/sync-rules.sh

REPO_DIR="$(dirname "$0")"
cd "$REPO_DIR" || exit 1

echo "🔄 Syncing RULE-SET files..."
echo "📅 $(date)"

# Apple Rules
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Apple/Apple.list" -o "rules/Apple/Apple.list"
curl -sL "https://raw.githubusercontent.com/Repcz/Tool/X/Shadowrocket/Rules/TestFlight.list" -o "rules/Apple/TestFlight.list"
curl -sL "https://github.com/Repcz/Tool/raw/X/Shadowrocket/Rules/APNs.list" -o "rules/Apple/APNs.list"

# Media Rules
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/YouTube/YouTube.list" -o "rules/Media/YouTube.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Netflix/Netflix.list" -o "rules/Media/Netflix.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Disney/Disney.list" -o "rules/Media/Disney.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/HBO/HBO.list" -o "rules/Media/HBO.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Spotify/Spotify.list" -o "rules/Media/Spotify.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/BiliBili/BiliBili.list" -o "rules/Media/BiliBili.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/TVB/TVB.list" -o "rules/Media/TVB.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/TikTok/TikTok.list" -o "rules/Media/TikTok.list"

# Social Rules
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Telegram/Telegram.list" -o "rules/Social/Telegram.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Twitter/Twitter.list" -o "rules/Social/Twitter.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Facebook/Facebook.list" -o "rules/Social/Facebook.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/WeChat/WeChat.list" -o "rules/Social/WeChat.list"

# Gaming Rules
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Steam/Steam.list" -o "rules/Gaming/Steam.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/SteamCN/SteamCN.list" -o "rules/Gaming/SteamCN.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Nintendo/Nintendo.list" -o "rules/Gaming/Nintendo.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Epic/Epic.list" -o "rules/Gaming/Epic.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Sony/Sony.list" -o "rules/Gaming/Sony.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Game/Game.list" -o "rules/Gaming/Game.list"

# CN Rules
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/China/China.list" -o "rules/CN/China.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Lan/Lan.list" -o "rules/CN/Lan.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/NetEaseMusic/NetEaseMusic.list" -o "rules/CN/NetEaseMusic.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Baidu/Baidu.list" -o "rules/CN/Baidu.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/DouBan/DouBan.list" -o "rules/CN/DouBan.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/DouYin/DouYin.list" -o "rules/CN/DouYin.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Sina/Sina.list" -o "rules/CN/Sina.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Zhihu/Zhihu.list" -o "rules/CN/Zhihu.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/XiaoHongShu/XiaoHongShu.list" -o "rules/CN/XiaoHongShu.list"
curl -sL "https://raw.githubusercontent.com/wlxuf/add_rule/main/direct-amend.list" -o "rules/CN/direct-amend.list"

# Global Rules
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/QuantumultX/Global/Global.list" -o "rules/Global/Global.list"
curl -sL "https://raw.githubusercontent.com/wlxuf/add_rule/main/proxy-amend.list" -o "rules/Global/proxy-amend.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/GitHub/GitHub.list" -o "rules/Global/GitHub.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Google/Google.list" -o "rules/Global/Google.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Microsoft/Microsoft.list" -o "rules/Global/Microsoft.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/PayPal/PayPal.list" -o "rules/Global/PayPal.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/Amazon/Amazon.list" -o "rules/Global/Amazon.list"
curl -sL "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Shadowrocket/AppleNews/AppleNews.list" -o "rules/Global/AppleNews.list"

# AI Rules
curl -sL "https://raw.githubusercontent.com/wlxuf/add_rule/main/ChatGPT.list" -o "rules/AI/ChatGPT.list"

# VN Rules
curl -sL "https://raw.githubusercontent.com/vuong2023/Rule/main/Rule/zalo.list" -o "rules/VN/zalo.list"

echo "✅ Sync completed! Downloaded $(find rules -type f | wc -l) files."
echo ""
echo "📦 To commit changes:"
echo "  git add rules/"
echo "  git commit -m 'chore: Weekly RULE-SET sync'"
echo "  git push"
