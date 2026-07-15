$ErrorActionPreference = 'Stop'

function Get-HookInput {
  $raw = [Console]::In.ReadToEnd()

  if ([string]::IsNullOrWhiteSpace($raw)) {
    return $null
  }

  return $raw | ConvertFrom-Json
}

function Get-StringCandidates {
  param(
    [Parameter(ValueFromPipeline = $true)]
    $Value
  )

  $results = New-Object System.Collections.Generic.List[string]

  function Add-Value {
    param($InnerValue)

    if ($null -eq $InnerValue) {
      return
    }

    if ($InnerValue -is [string]) {
      $trimmed = $InnerValue.Trim()
      if ($trimmed.Length -gt 0) {
        $results.Add($trimmed)
      }
      return
    }

    if ($InnerValue -is [System.Collections.IDictionary]) {
      foreach ($entry in $InnerValue.GetEnumerator()) {
        Add-Value $entry.Value
      }
      return
    }

    if ($InnerValue -is [System.Collections.IEnumerable] -and -not ($InnerValue -is [string])) {
      foreach ($item in $InnerValue) {
        Add-Value $item
      }
      return
    }

    foreach ($property in $InnerValue.PSObject.Properties) {
      Add-Value $property.Value
    }
  }

  Add-Value $Value
  return $results
}

function Test-SensitiveReference {
  param(
    [string]$Text
  )

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return $false
  }

  $patterns = @(
    '(^|[\\/])\.env(\.[^\\/\s]+)?$',
    '(^|[\\/])\.env(\.[^\\/\s]+)?([\\/\s]|$)',
    '(^|[\\/])(id_rsa|id_dsa|id_ed25519|known_hosts)([\\/\s]|$)',
    '\.(pem|p12|pfx|key|crt|cer|der|jks|keystore)([\\/\s]|$)',
    '(^|[\\/])(service-account|credentials?|secrets?)([._\\/-]|$)'
  )

  foreach ($pattern in $patterns) {
    if ($Text -match $pattern) {
      return $true
    }
  }

  return $false
}

function Test-SensitiveToolUse {
  param(
    [string]$ToolName,
    $ToolInput
  )

  $supportedTools = @(
    'read_file',
    'file_search',
    'grep_search',
    'list_dir',
    'run_in_terminal',
    'get_terminal_output',
    'send_to_terminal'
  )

  if ($supportedTools -notcontains $ToolName) {
    return $false
  }

  $candidates = @(Get-StringCandidates $ToolInput)

  foreach ($candidate in $candidates) {
    if (Test-SensitiveReference $candidate) {
      return $true
    }
  }

  return $false
}

$payload = Get-HookInput

if ($null -eq $payload) {
  Write-Output '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
  exit 0
}

$toolName = [string]$payload.tool_name
$toolInput = $payload.tool_input

if (Test-SensitiveToolUse -ToolName $toolName -ToolInput $toolInput) {
  $response = @{
    hookSpecificOutput = @{
      hookEventName = 'PreToolUse'
      permissionDecision = 'ask'
      permissionDecisionReason = 'This tool call references a secret-bearing file pattern such as .env, keys, or certificates. Approve only if you explicitly want Copilot to inspect it.'
      additionalContext = 'Prefer .env.example, typed config files, Expo config, and documented variable names instead of reading secret files directly.'
    }
  }

  $response | ConvertTo-Json -Depth 10 -Compress
  exit 0
}

Write-Output '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow"}}'
exit 0