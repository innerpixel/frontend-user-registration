#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emoji indicators
CHECK="✅"
WARN="⚠️"
FAIL="❌"
SCAN="🔍"

validate_explorer() {
    local explorer_id=$1
    local home_dir="/home/regular_$explorer_id"
    local all_passed=true
    local issues=()

    echo -e "\n${BLUE}🛸 Validating Space Explorer regular_$explorer_id${NC}"
    echo "=================================="

    # 1. Check Linux User
    echo -e "\n${YELLOW}${SCAN} Checking Basic Configuration${NC}"
    if id "regular_$explorer_id" >/dev/null 2>&1; then
        echo -e "${GREEN}${CHECK} Linux user exists${NC}"
    else
        echo -e "${RED}${FAIL} Linux user does not exist${NC}"
        all_passed=false
        issues+=("Create Linux user: regular_$explorer_id")
    fi

    # 2. Check Home Directory Structure
    echo -e "\n${YELLOW}${SCAN} Validating Directory Structure${NC}"
    
    # Check home directory
    if [ -d "$home_dir" ]; then
        echo -e "${GREEN}${CHECK} Home directory exists${NC}"
    else
        echo -e "${RED}${FAIL} Home directory missing${NC}"
        all_passed=false
        issues+=("Create home directory: $home_dir")
    fi

    # Check Maildir structure
    local maildir_paths=(
        "Maildir/cur"
        "Maildir/new"
        "Maildir/tmp"
        "Maildir/.Sent/cur"
        "Maildir/.Sent/new"
        "Maildir/.Sent/tmp"
        "Maildir/.Drafts/cur"
        "Maildir/.Drafts/new"
        "Maildir/.Drafts/tmp"
        "Maildir/.Trash/cur"
        "Maildir/.Trash/new"
        "Maildir/.Trash/tmp"
    )

    for path in "${maildir_paths[@]}"; do
        if [ -d "$home_dir/$path" ]; then
            echo -e "${GREEN}${CHECK} $path exists${NC}"
        else
            echo -e "${RED}${FAIL} $path missing${NC}"
            all_passed=false
            issues+=("Create directory: $home_dir/$path")
        fi
    done

    # 3. Check Permissions
    echo -e "\n${YELLOW}${SCAN} Validating Permissions${NC}"
    
    # Check Maildir permissions
    if [ -d "$home_dir/Maildir" ]; then
        maildir_perms=$(stat -c "%a" "$home_dir/Maildir")
        if [ "$maildir_perms" = "700" ]; then
            echo -e "${GREEN}${CHECK} Maildir permissions correct (700)${NC}"
        else
            echo -e "${RED}${FAIL} Maildir has incorrect permissions: $maildir_perms${NC}"
            all_passed=false
            issues+=("Fix Maildir permissions: chmod 700 $home_dir/Maildir")
        fi
    fi

    # Check public_html permissions
    if [ -d "$home_dir/public_html" ]; then
        public_perms=$(stat -c "%a" "$home_dir/public_html")
        if [ "$public_perms" = "755" ]; then
            echo -e "${GREEN}${CHECK} public_html permissions correct (755)${NC}"
        else
            echo -e "${RED}${FAIL} public_html has incorrect permissions: $public_perms${NC}"
            all_passed=false
            issues+=("Fix public_html permissions: chmod 755 $home_dir/public_html")
        fi
    else
        echo -e "${RED}${FAIL} public_html directory missing${NC}"
        all_passed=false
        issues+=("Create public_html directory")
    fi

    # 4. Check Neomutt Configuration
    echo -e "\n${YELLOW}${SCAN} Validating Mail Configuration${NC}"
    
    if [ -f "$home_dir/.config/neomutt/neomuttrc" ]; then
        echo -e "${GREEN}${CHECK} Neomutt configuration exists${NC}"
        
        # Check for required settings
        local required_settings=(
            "set mbox_type=Maildir"
            "set from=\"regular_$explorer_id@ld-csmlmail.test\""
            "Organization: CSMCL Space Development Division"
        )
        
        for setting in "${required_settings[@]}"; do
            if grep -q "$setting" "$home_dir/.config/neomutt/neomuttrc"; then
                echo -e "${GREEN}${CHECK} Found setting: $setting${NC}"
            else
                echo -e "${RED}${FAIL} Missing setting: $setting${NC}"
                all_passed=false
                issues+=("Add setting to neomuttrc: $setting")
            fi
        done
    else
        echo -e "${RED}${FAIL} Neomutt configuration missing${NC}"
        all_passed=false
        issues+=("Create neomutt configuration")
    fi

    # 5. Check Postfix Virtual Alias
    echo -e "\n${YELLOW}${SCAN} Validating Mail Routing${NC}"
    if grep -q "regular_$explorer_id@ld-csmlmail.test.*regular_$explorer_id" /etc/postfix/virtual; then
        echo -e "${GREEN}${CHECK} Postfix virtual alias exists${NC}"
    else
        echo -e "${RED}${FAIL} Postfix virtual alias missing${NC}"
        all_passed=false
        issues+=("Add virtual alias for regular_$explorer_id")
    fi

    # Final Report
    echo -e "\n${BLUE}📊 Validation Summary for Space Explorer regular_$explorer_id${NC}"
    echo "=================================="
    if [ "$all_passed" = true ]; then
        echo -e "${GREEN}🌟 All systems operational! Ready for space exploration!${NC}"
    else
        echo -e "${RED}⚠️ Some systems need attention${NC}"
        echo -e "\n${YELLOW}Required Actions:${NC}"
        for issue in "${issues[@]}"; do
            echo -e "${RED}  - $issue${NC}"
        done
    fi
}

# Check if an explorer ID was provided
if [ -z "$1" ]; then
    echo "Usage: $0 <explorer_id>"
    echo "Example: $0 0001"
    exit 1
fi

# Run validation
validate_explorer "$1"
