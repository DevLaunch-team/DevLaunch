#[cfg(test)]
mod tests {
    use borsh::{BorshDeserialize, BorshSerialize};
    use devlaunch_contracts::{TokenInstruction, TokenTemplate};
    use solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        system_instruction,
    };
    use solana_program_test::*;
    use solana_sdk::{
        account::Account,
        signature::{Keypair, Signer},
        transaction::Transaction,
    };
    use std::mem::size_of;

    #[tokio::test]
    async fn test_create_token_template() {
        // Create program and test environment
        let program_id = Pubkey::new_unique();
        let mut program_test = ProgramTest::new(
            "devlaunch_contracts",
            program_id,
            processor!(devlaunch_contracts::process_instruction),
        );

        // Create accounts for test
        let admin = Keypair::new();
        let template_account = Keypair::new();
        let template_data_size = size_of::<TokenTemplate>() + 100; // Extra space for serialization

        // Add admin account with some lamports
        program_test.add_account(
            admin.pubkey(),
            Account {
                lamports: 1000000000, // 1 SOL
                ..Account::default()
            },
        );

        // Start the test environment
        let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

        // Create the template account using system program
        let create_account_ix = system_instruction::create_account(
            &payer.pubkey(),
            &template_account.pubkey(),
            10000000, // lamports
            template_data_size as u64,
            &program_id,
        );

        // Create instruction data for creating token template
        let template_name = "Test Token".to_string();
        let template_symbol = "TEST".to_string();
        let template_decimals = 9;

        let instruction_data = TokenInstruction::CreateTemplate {
            name: template_name.clone(),
            symbol: template_symbol.clone(),
            decimals: template_decimals,
        }
        .try_to_vec()
        .unwrap();

        // Create the program instruction
        let create_template_ix = Instruction {
            program_id,
            accounts: vec![
                AccountMeta::new(template_account.pubkey(), false),
                AccountMeta::new_readonly(admin.pubkey(), true),
            ],
            data: instruction_data,
        };

        // Create and send the transaction
        let transaction = Transaction::new_signed_with_payer(
            &[create_account_ix, create_template_ix],
            Some(&payer.pubkey()),
            &[&payer, &template_account, &admin],
            recent_blockhash,
        );

        // Process the transaction
        banks_client.process_transaction(transaction).await.unwrap();

        // Verify the template was created correctly
        let template_account_data = banks_client
            .get_account(template_account.pubkey())
            .await
            .unwrap()
            .unwrap();

        let template = TokenTemplate::try_from_slice(&template_account_data.data).unwrap();

        assert_eq!(template.name, template_name);
        assert_eq!(template.symbol, template_symbol);
        assert_eq!(template.decimals, template_decimals);
        assert_eq!(template.is_active, true);
        assert_eq!(template.created_by, admin.pubkey());
    }
} 